"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import * as z from "zod";

const lessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  type: z.enum(["video", "text", "quiz"], {
    required_error: "Please select a lesson type",
  }),
  duration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 minute")
    .optional(),
  order: z.coerce.number().min(1, "Order must be at least 1"),
  videoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
});

const lessonTypes = [
  { value: "video", label: "Video Lesson" },
  { value: "text", label: "Text/Article" },
  { value: "quiz", label: "Quiz" },
];

export default function CreateLesson() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      type: "video",
      duration: 10,
      order: 1,
      videoUrl: "",
      isPublished: false,
    },
  });

  const watchedType = watch("type");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const lessonData = {
        ...data,
        course: courseId,
      };

      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create lesson");
      }

      toast.success("Lesson created successfully!");
      router.push(`/admin/courses/${courseId}`);
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error(error.message || "Failed to create lesson");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/courses/${courseId}`}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Lesson</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Information</CardTitle>
              <CardDescription>
                Enter the basic details for your lesson
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter lesson title"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the lesson"
                  rows={3}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Lesson Type *</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lesson type" />
                        </SelectTrigger>
                        <SelectContent>
                          {lessonTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && (
                    <p className="text-sm text-red-600">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="10"
                    {...register("duration")}
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-600">
                      {errors.duration.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Lesson Order *</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  placeholder="1"
                  {...register("order")}
                />
                {errors.order && (
                  <p className="text-sm text-red-600">{errors.order.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Media Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Media & Settings</CardTitle>
              <CardDescription>
                Configure lesson media and publication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchedType === "video" && (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    {...register("videoUrl")}
                  />
                  {errors.videoUrl && (
                    <p className="text-sm text-red-600">
                      {errors.videoUrl.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Supports YouTube, Vimeo, and direct video file URLs (.mp4,
                    .webm, etc.)
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    {...register("isPublished")}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isPublished">
                    Publish lesson immediately
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  Published lessons will be visible to enrolled students
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Lesson Types</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>Video:</strong> Video lessons with player
                  </li>
                  <li>
                    • <strong>Text:</strong> Article-style content
                  </li>
                  <li>
                    • <strong>Quiz:</strong> Interactive assessments
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lesson Content */}
        <Card>
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
            <CardDescription>
              Write the main content for your lesson
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                {...register("content")}
                placeholder="Write your lesson content here. Include explanations, examples, and key points..."
                className="min-h-[200px]"
                rows={10}
              />
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Supports markdown formatting. For video lessons, include
                timestamps and key points.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Creating..." : "Create Lesson"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/courses/${courseId}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

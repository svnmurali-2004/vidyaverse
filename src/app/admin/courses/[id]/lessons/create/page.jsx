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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Plus, Trash2, Code } from "lucide-react";
import Link from "next/link";
import * as z from "zod";

const lessonSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"), // Reduced from 50 for DSA lessons
    type: z.enum(["video", "text", "quiz", "dsa"], {
      required_error: "Please select a lesson type",
    }),
    duration: z.coerce
      .number()
      .min(1, "Duration must be at least 1 minute")
      .optional(),
    order: z.coerce.number().min(1, "Order must be at least 1"),
    videoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    isPublished: z.boolean().default(false),
    // DSA-specific fields - made optional to avoid validation errors
    dsaSheet: z
      .object({
        categories: z.array(
          z.object({
            title: z.string(),
            description: z.string().optional(),
            problems: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                difficulty: z.enum(["Easy", "Medium", "Hard"]),
                topic: z.string().optional(),
                leetcodeUrl: z.string().optional(),
                solutionUrl: z.string().optional(),
                companies: z.array(z.string()).optional(),
                notes: z.string().optional(),
              })
            ),
          })
        ),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Custom validation: video lessons must have videoUrl
      if (data.type === "video" && (!data.videoUrl || data.videoUrl === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Video URL is required for video lessons",
      path: ["videoUrl"],
    }
  );

const lessonTypes = [
  { value: "video", label: "Video Lesson" },
  { value: "text", label: "Text/Article" },
  { value: "quiz", label: "Quiz" },
  { value: "dsa", label: "DSA Problem Sheet" },
];

export default function CreateLesson() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dsaCategories, setDsaCategories] = useState([
    {
      title: "Arrays",
      description: "Array manipulation and algorithms",
      problems: [
        {
          id: "two-sum",
          title: "Two Sum",
          difficulty: "Easy",
          topic: "Array, Hash Table",
          leetcodeUrl: "",
          companies: [],
          notes: "",
        },
      ],
    },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      description: "",
      content:
        "DSA problem sheet content will be generated based on the problems below.",
      type: "video",
      duration: 10,
      order: 1,
      videoUrl: "",
      isPublished: false,
      dsaSheet: {
        categories: [],
      },
    },
  });

  const watchedType = watch("type");

  // Update content automatically for DSA lessons
  const updateContentForDSA = () => {
    if (watchedType === "dsa") {
      const totalProblems = dsaCategories.reduce(
        (total, cat) => total + cat.problems.length,
        0
      );
      const content = `This lesson contains a DSA problem sheet with ${dsaCategories.length} categories and ${totalProblems} problems total. Work through each problem systematically and track your progress.`;
      setValue("content", content);
    }
  };

  // DSA Management Functions
  const addCategory = () => {
    const newCategory = {
      title: "",
      description: "",
      problems: [],
    };
    const updatedCategories = [...dsaCategories, newCategory];
    setDsaCategories(updatedCategories);
    setValue("dsaSheet.categories", updatedCategories);
    updateContentForDSA();
  };

  const removeCategory = (categoryIndex) => {
    const updatedCategories = dsaCategories.filter(
      (_, index) => index !== categoryIndex
    );
    setDsaCategories(updatedCategories);
    setValue("dsaSheet.categories", updatedCategories);
    updateContentForDSA();
  };

  const updateCategory = (categoryIndex, field, value) => {
    const updatedCategories = [...dsaCategories];
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      [field]: value,
    };
    setDsaCategories(updatedCategories);
    setValue("dsaSheet.categories", updatedCategories);
    updateContentForDSA();
  };

  const addProblem = (categoryIndex) => {
    const newProblem = {
      id: `problem-${Date.now()}`, // Auto-generate unique ID
      title: "",
      difficulty: "Easy",
      topic: "",
      leetcodeUrl: "",
      companies: [],
      notes: "",
    };
    const updatedCategories = [...dsaCategories];
    updatedCategories[categoryIndex].problems.push(newProblem);
    setDsaCategories(updatedCategories);
    setValue("dsaSheet.categories", updatedCategories);
    updateContentForDSA();
  };

  const removeProblem = (categoryIndex, problemIndex) => {
    const updatedCategories = [...dsaCategories];
    updatedCategories[categoryIndex].problems = updatedCategories[
      categoryIndex
    ].problems.filter((_, index) => index !== problemIndex);
    setDsaCategories(updatedCategories);
    setValue("dsaSheet.categories", updatedCategories);
    updateContentForDSA();
  };

  const updateProblem = (categoryIndex, problemIndex, field, value) => {
    const updatedCategories = [...dsaCategories];
    updatedCategories[categoryIndex].problems[problemIndex] = {
      ...updatedCategories[categoryIndex].problems[problemIndex],
      [field]: value,
    };
    setDsaCategories(updatedCategories);
    setValue("dsaSheet.categories", updatedCategories);
    updateContentForDSA();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const lessonData = {
        ...data,
        course: courseId,
      };

      // For DSA lessons, include the current DSA categories state
      if (data.type === "dsa") {
        lessonData.dsaSheet = {
          categories: dsaCategories,
        };
      }

      console.log("Submitting lesson data:", lessonData);

      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Detailed error:", error);
        throw new Error(
          error.error || error.message || "Failed to create lesson"
        );
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
                  <li>
                    • <strong>DSA:</strong> Data Structures & Algorithms problem
                    sheets
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
                placeholder={
                  watchedType === "dsa"
                    ? "This will be auto-generated based on your DSA problems below..."
                    : "Write your lesson content here. Include explanations, examples, and key points..."
                }
                className="min-h-[200px]"
                rows={10}
                readOnly={watchedType === "dsa"}
              />
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {watchedType === "dsa"
                  ? "Content is automatically generated for DSA lessons based on the problems you add below."
                  : "Supports markdown formatting. For video lessons, include timestamps and key points."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* DSA Sheet Builder */}
        {watchedType === "dsa" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    DSA Problem Sheet
                  </CardTitle>
                  <CardDescription>
                    Create categories and add programming problems for students
                    to solve
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={addCategory}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {dsaCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        Category {categoryIndex + 1}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(categoryIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category Title</Label>
                        <Input
                          value={category.title}
                          onChange={(e) =>
                            updateCategory(
                              categoryIndex,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Arrays, Linked Lists"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={category.description}
                          onChange={(e) =>
                            updateCategory(
                              categoryIndex,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Brief description of the category"
                        />
                      </div>
                    </div>

                    {/* Problems in this category */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Problems</Label>
                        <Button
                          type="button"
                          onClick={() => addProblem(categoryIndex)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Problem
                        </Button>
                      </div>

                      {category.problems.map((problem, problemIndex) => (
                        <Card
                          key={problemIndex}
                          className="bg-gray-50 border border-gray-300"
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                Problem {problemIndex + 1}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeProblem(categoryIndex, problemIndex)
                                }
                                className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Problem ID</Label>
                                <Input
                                  value={problem.id}
                                  onChange={(e) =>
                                    updateProblem(
                                      categoryIndex,
                                      problemIndex,
                                      "id",
                                      e.target.value
                                    )
                                  }
                                  placeholder="unique-id"
                                  className="text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Problem Title</Label>
                                <Input
                                  value={problem.title}
                                  onChange={(e) =>
                                    updateProblem(
                                      categoryIndex,
                                      problemIndex,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Two Sum"
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Difficulty</Label>
                                <Select
                                  value={problem.difficulty}
                                  onValueChange={(value) =>
                                    updateProblem(
                                      categoryIndex,
                                      problemIndex,
                                      "difficulty",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">
                                      Medium
                                    </SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Topic</Label>
                                <Input
                                  value={problem.topic}
                                  onChange={(e) =>
                                    updateProblem(
                                      categoryIndex,
                                      problemIndex,
                                      "topic",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Array, Hash Table"
                                  className="text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">LeetCode URL</Label>
                                <Input
                                  value={problem.leetcodeUrl}
                                  onChange={(e) =>
                                    updateProblem(
                                      categoryIndex,
                                      problemIndex,
                                      "leetcodeUrl",
                                      e.target.value
                                    )
                                  }
                                  placeholder="https://leetcode.com/..."
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Notes</Label>
                              <Textarea
                                value={problem.notes}
                                onChange={(e) =>
                                  updateProblem(
                                    categoryIndex,
                                    problemIndex,
                                    "notes",
                                    e.target.value
                                  )
                                }
                                placeholder="Hints, tips, or important notes about this problem"
                                className="text-sm"
                                rows={2}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {category.problems.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No problems added yet. Click "Add Problem" to get
                          started.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {dsaCategories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No categories added yet. Click "Add Category" to start
                  building your DSA sheet.
                </div>
              )}
            </CardContent>
          </Card>
        )}

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

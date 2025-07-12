"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { buttonVariants } from "@/components/ui/button";
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
import {
  createCourseSchema,
  courseCategories,
  courseLevels,
  courseStatuses,
} from "@/lib/validations/course";

export default function EditCourse() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      price: 0,
      category: "",
      level: "beginner",
      status: "draft",
      thumbnail: "",
    },
  });

  const watchedShortDescription = watch("shortDescription");
  const watchedTitle = watch("title");
  const watchedPrice = watch("price");
  const watchedCategory = watch("category");
  const watchedLevel = watch("level");
  const watchedDescription = watch("description");

  // Fetch course data for editing
  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        const course = data.data;

        // Populate form with existing data
        reset({
          title: course.title || "",
          shortDescription: course.shortDescription || "",
          description: course.description || "",
          price: course.price || 0,
          category: course.category || "",
          level: course.level || "beginner",
          status: course.status || "draft",
          thumbnail: course.thumbnail || "",
        });

        setThumbnailUrl(course.thumbnail || "");
      } else {
        toast.error("Failed to load course data");
        router.push("/admin/courses");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course data");
      router.push("/admin/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setThumbnailFile(file);
    setIsUploadingThumbnail(true);

    try {
      // Upload to Vercel Blob storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "courses/thumbnails");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await response.json();
      setThumbnailUrl(data.url);
      setValue("thumbnail", data.url);
      toast.success("Thumbnail uploaded successfully to Vercel Blob!");
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast.error(error.message || "Failed to upload thumbnail");
      setThumbnailFile(null);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const courseData = {
        title: data.title,
        shortDescription: data.shortDescription,
        description: data.description,
        price: parseFloat(data.price) || 0,
        category: data.category,
        level: data.level,
        thumbnail: data.thumbnail || "",
        slug,
        status: data.status,
        isPublished: data.status === "published",
      };

      // Update course via API
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("API Error Response:", error);
        throw new Error(
          error.error || error.message || "Failed to update course"
        );
      }

      const result = await response.json();

      toast.success(`Course "${data.title}" updated successfully!`);

      // Redirect to the course management page
      router.push("/admin/courses");
      router.refresh(); // Refresh to show updated data
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(
        error.message || "Failed to update course. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/courses/"
          className={buttonVariants({
            variant: "outline",
            size: "icon",
          })}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Edit the basic details for your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter course title"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <span className="text-xs text-muted-foreground">
                    {watchedShortDescription?.length || 0}/200 characters
                  </span>
                </div>
                <Textarea
                  id="shortDescription"
                  placeholder="Enter a brief course overview (used in course cards and previews)"
                  rows={3}
                  {...register("shortDescription")}
                />
                {errors.shortDescription && (
                  <p className="text-sm text-red-600">
                    {errors.shortDescription.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Course Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>
                Configure course category, level, and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Difficulty Level *</Label>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.level && (
                  <p className="text-sm text-red-600">{errors.level.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseStatuses.slice(0, 2).map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Description Card */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Course Description</CardTitle>
            <CardDescription>
              Provide a comprehensive description of your course content,
              learning objectives, and what students will achieve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Detailed Description *</Label>
              <Textarea
                {...register("description")}
                placeholder="Write a detailed course description. Include learning objectives, course structure, prerequisites, and what students will achieve..."
                className="min-h-[150px]"
                rows={8}
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Write a detailed description of your course. Include learning
                objectives, course structure, prerequisites, and what students
                will achieve.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Course Preview */}
        <Card className="bg-green-50/50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Course Preview</CardTitle>
            <CardDescription className="text-green-700">
              See how your course will appear to students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Card Preview */}
            <div>
              <h4 className="font-medium text-green-900 mb-3">
                Course Card Preview
              </h4>
              <div className="bg-white border rounded-lg p-4 max-w-sm">
                {(thumbnailFile || thumbnailUrl) && (
                  <img
                    src={thumbnailUrl || URL.createObjectURL(thumbnailFile)}
                    alt="Course thumbnail"
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}
                {!thumbnailFile && !thumbnailUrl && (
                  <div className="w-full h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-500">
                    No thumbnail uploaded
                  </div>
                )}
                <h5 className="font-semibold text-gray-900 mb-2">
                  {watchedTitle || "Course Title"}
                </h5>
                <p className="text-sm text-gray-600 mb-3">
                  {watchedShortDescription ||
                    "Short description will appear here..."}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    ${watchedPrice || 0}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {watchedLevel || "beginner"}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Description Preview */}
            <div>
              <h4 className="font-medium text-green-900 mb-3">
                Detailed Description Preview
              </h4>
              <div className="bg-white border rounded-lg p-4">
                {watchedDescription ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {watchedDescription}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Detailed description will appear here...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Course Thumbnail</CardTitle>
            <CardDescription>
              Upload a thumbnail image for your course (optional) - Images are
              stored in Vercel Blob
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  id="thumbnail-upload"
                  disabled={isUploadingThumbnail}
                />
                <Label
                  htmlFor="thumbnail-upload"
                  className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 ${
                    isUploadingThumbnail ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="size-4" />
                  {isUploadingThumbnail ? "Uploading..." : "Choose Thumbnail"}
                </Label>
                {thumbnailFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {thumbnailFile.name}
                    </span>
                    {thumbnailUrl && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        ✓ Uploaded
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Supported formats: JPEG, PNG, WebP</p>
                <p>• Maximum file size: 5MB</p>
                <p>• Recommended dimensions: 1200x675px (16:9 ratio)</p>
                <p>
                  • Images are automatically uploaded to Vercel Blob storage
                </p>
              </div>

              {(thumbnailFile || thumbnailUrl) && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <img
                    src={thumbnailUrl || URL.createObjectURL(thumbnailFile)}
                    alt="Thumbnail preview"
                    className="w-32 h-24 object-cover rounded-md border"
                  />
                  {thumbnailUrl && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                      ✓ Successfully uploaded to Vercel Blob
                      <br />
                      <span className="font-mono text-xs break-all">
                        {thumbnailUrl}
                      </span>
                    </div>
                  )}
                </div>
              )}
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
            {isSubmitting ? "Updating..." : "Update Course"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/courses")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

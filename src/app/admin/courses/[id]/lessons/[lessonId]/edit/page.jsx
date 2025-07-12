"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Plus, Trash2, Upload } from "lucide-react";

export default function LessonEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id: courseId, lessonId } = params;

  const [lesson, setLesson] = useState({
    title: "",
    description: "",
    content: "",
    type: "text",
    videoUrl: "",
    duration: "",
    order: 1,
    isPublished: false,
    isPreview: false,
    resources: [],
  });
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lessonId && courseId) {
      fetchLessonDetails();
    }
  }, [lessonId, courseId]);

  const fetchLessonDetails = async () => {
    try {
      // Fetch lesson details
      const lessonResponse = await fetch(`/api/lessons/${lessonId}`);
      if (lessonResponse.ok) {
        const lessonData = await lessonResponse.json();
        const fetchedLesson = lessonData.data;

        console.log("Fetched lesson data:", fetchedLesson);

        // Ensure all fields have default values
        setLesson({
          title: fetchedLesson.title || "",
          description: fetchedLesson.description || "",
          content: fetchedLesson.content || "",
          type: fetchedLesson.type || "text",
          videoUrl: fetchedLesson.videoUrl || "",
          duration: fetchedLesson.duration || "",
          order: fetchedLesson.order || 1,
          isPublished: fetchedLesson.isPublished || false,
          isPreview: fetchedLesson.isPreview || false,
          resources: fetchedLesson.resources || [],
        });

        console.log("Set lesson state with:", {
          type: fetchedLesson.type || "text",
          isPreview: fetchedLesson.isPreview || false,
        });
      }

      // Fetch course details
      const courseResponse = await fetch(`/api/courses/${courseId}`);
      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        setCourse(courseData.data);
      }
    } catch (error) {
      console.error("Error fetching lesson details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLesson((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSwitchChange = (name, checked) => {
    console.log(`Switching ${name} to ${checked}`);
    setLesson((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const addResource = () => {
    setLesson((prev) => ({
      ...prev,
      resources: [...prev.resources, { title: "", url: "", type: "file" }],
    }));
  };

  const updateResource = (index, field, value) => {
    setLesson((prev) => ({
      ...prev,
      resources: prev.resources.map((resource, i) =>
        i === index ? { ...resource, [field]: value } : resource
      ),
    }));
  };

  const removeResource = (index) => {
    setLesson((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...lesson,
        course: courseId,
        duration: parseInt(lesson.duration) || 0,
        order: parseInt(lesson.order) || 1,
      };

      console.log("Updating lesson with data:", updateData);

      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Update successful:", result);
        router.push(`/admin/courses/${courseId}/lessons/${lessonId}`);
      } else {
        const error = await response.json();
        console.error("Error updating lesson:", error);
        alert(`Failed to update lesson: ${error.error || "Please try again"}`);
      }
    } catch (error) {
      console.error("Error updating lesson:", error);
      alert("Failed to update lesson. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson || !lesson.title) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/courses/${courseId}/lessons/${lessonId}`}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lesson
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Lesson
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {course?.title} • {lesson.title}
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Configure the lesson title, description, and content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={lesson.title}
                    onChange={handleInputChange}
                    placeholder="Enter lesson title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={lesson.description}
                    onChange={handleInputChange}
                    placeholder="Enter lesson description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Lesson Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={lesson.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="video">Video</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                {lesson.type === "video" && (
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      name="videoUrl"
                      value={lesson.videoUrl}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      type="url"
                    />
                    <p className="text-xs text-gray-500">
                      Supports YouTube, Vimeo, and direct video file URLs (.mp4,
                      .webm, etc.)
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={lesson.content}
                    onChange={handleInputChange}
                    placeholder="Enter lesson content"
                    rows={8}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Resources</CardTitle>
                    <CardDescription>
                      Add downloadable resources for this lesson
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addResource}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lesson.resources && lesson.resources.length > 0 ? (
                  lesson.resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-end p-4 border rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <Label>Resource Title</Label>
                        <Input
                          value={resource.title}
                          onChange={(e) =>
                            updateResource(index, "title", e.target.value)
                          }
                          placeholder="Resource title"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Resource URL</Label>
                        <Input
                          value={resource.url}
                          onChange={(e) =>
                            updateResource(index, "url", e.target.value)
                          }
                          placeholder="Resource URL"
                          type="url"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeResource(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No resources added yet. Click "Add Resource" to get started.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lesson Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Lesson Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="0"
                    value={lesson.duration}
                    onChange={handleInputChange}
                    placeholder="Duration in minutes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Lesson Order</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    min="1"
                    value={lesson.order}
                    onChange={handleInputChange}
                    placeholder="Lesson order"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isPublished">Published</Label>
                  <Switch
                    id="isPublished"
                    checked={lesson.isPublished}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isPublished", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isPreview">Free Preview</Label>
                  <Switch
                    id="isPreview"
                    checked={lesson.isPreview}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isPreview", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button type="submit" className="w-full" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Link href={`/admin/courses/${courseId}/lessons/${lessonId}`}>
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

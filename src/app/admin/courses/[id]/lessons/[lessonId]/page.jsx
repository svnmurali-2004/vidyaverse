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
import { Badge } from "@/components/ui/badge";
import VideoPlayer from "@/components/VideoPlayer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  ArrowLeft,
  Edit,
  Play,
  Clock,
  FileText,
  Video,
  Download,
  ExternalLink,
} from "lucide-react";

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const { id: courseId, lessonId } = params;

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId && courseId) {
      fetchLessonDetails();
    }
  }, [lessonId, courseId]);

  const fetchLessonDetails = async () => {
    try {
      console.log("Fetching lesson details for:", lessonId);
      // Fetch lesson details
      const lessonResponse = await fetch(`/api/lessons/${lessonId}`);
      console.log("Lesson response status:", lessonResponse.status);

      if (lessonResponse.ok) {
        const lessonData = await lessonResponse.json();
        console.log("Lesson data:", lessonData);
        setLesson(lessonData.data);
      } else {
        console.error("Failed to fetch lesson:", lessonResponse.status);
      }

      // Fetch course details
      const courseResponse = await fetch(`/api/courses/${courseId}`);
      console.log("Course response status:", courseResponse.status);

      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        console.log("Course data:", courseData);
        setCourse(courseData.data);
      } else {
        console.error("Failed to fetch course:", courseResponse.status);
      }
    } catch (error) {
      console.error("Error fetching lesson details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson || !lesson._id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lesson not found</p>
      </div>
    );
  }

  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "text":
        return <FileText className="h-5 w-5" />;
      case "quiz":
        return <Play className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/courses/${courseId}`}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {lesson?.title || "Loading..."}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {course?.title} • Lesson Details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/courses/${courseId}/lessons/${lessonId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Lesson
            </Button>
          </Link>
          <Badge variant={lesson?.isPublished ? "default" : "secondary"}>
            {lesson?.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      {/* Lesson Details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Lesson Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {getLessonIcon(lesson?.type)}
                <div>
                  <CardTitle>{lesson?.title}</CardTitle>
                  <CardDescription>
                    {lesson?.type
                      ? lesson.type.charAt(0).toUpperCase() +
                        lesson.type.slice(1)
                      : "Text"}{" "}
                    Lesson
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lesson?.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {lesson.description}
                  </p>
                </div>
              )}

              {lesson?.content && (
                <div>
                  <h4 className="font-semibold mb-2">Content</h4>
                  <div className="prose max-w-none">
                    <MarkdownRenderer
                      content={lesson.content}
                      className="text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </div>
              )}

              {/* Video Content */}
              {lesson?.type === "video" && lesson?.videoUrl && (
                <div>
                  <h4 className="font-semibold mb-2">Video Preview</h4>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <VideoPlayer
                      videoUrl={lesson.videoUrl}
                      title={lesson.title}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <a
                      href={lesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Original URL
                    </a>
                  </div>
                </div>
              )}

              {/* Resources */}
              {lesson.resources && lesson.resources.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Resources</h4>
                  <div className="space-y-2">
                    {lesson.resources.map((resource, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {resource.title}
                          </span>
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lesson Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Duration: {lesson?.duration || "Not set"} minutes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Order: {lesson?.order || "Not set"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Type:{" "}
                  {lesson?.type
                    ? lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)
                    : "Text"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Preview: {lesson?.isPreview ? "Yes" : "No"}
                </span>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={lesson?.isPublished ? "default" : "secondary"}>
                  {lesson?.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href={`/admin/courses/${courseId}/lessons/${lessonId}/edit`}
              >
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Lesson
                </Button>
              </Link>
              <Link href={`/courses/${courseId}/learn?lesson=${lessonId}`}>
                <Button variant="outline" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Preview as Student
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

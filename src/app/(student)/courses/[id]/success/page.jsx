"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Download,
  Play,
  Share2,
  Award,
  BookOpen,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { use } from "react";

export default function SuccessPage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchEnrollment();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data.data);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const fetchEnrollment = async () => {
    try {
      const response = await fetch(`/api/enrollments?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setEnrollment(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching enrollment:", error);
    } finally {
      setLoading(false);
    }
  };

  const shareSuccess = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I just enrolled in ${course?.title}!`,
          text: `Check out this amazing course on VidyaVerse`,
          url: window.location.origin + `/student/courses/${courseId}`,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        window.location.origin + `/student/courses/${courseId}`
      );
      toast.success("Course link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Congratulations!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          You have successfully enrolled in the course
        </p>
      </div>

      {/* Course Details */}
      {course && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <img
                src={course.thumbnail || "/placeholder-course.jpg"}
                alt={course.title}
                className="w-32 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                <p className="text-gray-600 mb-3">{course.shortDescription}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.instructor?.name}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {course.lessonCount || 0} lessons
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration || "Self-paced"}
                  </div>
                  <Badge variant="secondary">{course.level}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrollment Details */}
      {enrollment && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enrollment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Enrollment Date
                </label>
                <p className="text-lg">
                  {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Access
                </label>
                <p className="text-lg">Lifetime</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Progress
                </label>
                <p className="text-lg">{enrollment.progress || 0}% Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Button asChild size="lg" className="h-16">
          <Link href={`/student/courses/${courseId}/learn`}>
            <Play className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Start Learning</div>
              <div className="text-sm opacity-80">
                Begin your course journey
              </div>
            </div>
          </Link>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="h-16"
          onClick={shareSuccess}
        >
          <Share2 className="h-6 w-6 mr-3" />
          <div className="text-left">
            <div className="font-semibold">Share Achievement</div>
            <div className="text-sm opacity-80">
              Tell others about your enrollment
            </div>
          </div>
        </Button>
      </div>

      {/* What's Next */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Start Learning</h3>
              <p className="text-sm text-gray-600">
                Begin with the first lesson and progress at your own pace
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-sm text-gray-600">
                Monitor your learning progress and complete assignments
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Get Certificate</h3>
              <p className="text-sm text-gray-600">
                Complete the course to earn your certificate of achievement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Resources */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Course Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Course Materials</div>
                  <div className="text-sm text-gray-600">
                    Downloadable resources and assignments
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Access
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Discussion Forum</div>
                  <div className="text-sm text-gray-600">
                    Connect with other students and instructors
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Join
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Certificate</div>
                  <div className="text-sm text-gray-600">
                    Available upon course completion
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Complete Course
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/student/courses">Browse More Courses</Link>
        </Button>

        <Button asChild variant="outline" className="flex-1">
          <Link href="/student/dashboard">Go to Dashboard</Link>
        </Button>

        <Button asChild className="flex-1">
          <Link href={`/student/courses/${courseId}/learn`}>
            Start Learning Now
          </Link>
        </Button>
      </div>

      {/* Thank You Message */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">
            Thank You for Choosing VidyaVerse!
          </h3>
          <p className="text-gray-600">
            We're excited to be part of your learning journey. If you have any
            questions, don't hesitate to reach out to our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

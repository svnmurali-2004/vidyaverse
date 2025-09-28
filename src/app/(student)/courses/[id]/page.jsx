"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  User,
  Share2,
  Heart,
  Check,
  Lock,
  ChevronRight,
  Globe,
  Download,
  ThumbsUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { use } from "react";

export default function CourseDetailPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);

    // Fetch all main data in parallel
    const coursePromise = fetch(`/api/courses/${courseId}?includeDetails=true`).then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        setCourse(data.data);
        return data.data;
      } else {
        toast.error("Course not found");
        router.push("/student/courses");
        return null;
      }
    }).catch((error) => {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course");
      return null;
    });

    const lessonsPromise = fetch(`/api/lessons?courseId=${courseId}`).then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        setLessons(data.data || []);
      }
    }).catch((error) => {
      console.error("Error fetching lessons:", error);
    });

    const reviewsPromise = fetch(`/api/reviews?courseId=${courseId}`).then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || []);
      }
    }).catch((error) => {
      console.error("Error fetching reviews:", error);
    });

    // Related courses depend on course category, so wait for course fetch
    coursePromise.then((courseData) => {
      if (!courseData) return;
      fetch(`/api/courses?limit=4&category=${courseData.category}`)
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            setRelatedCourses(data.data?.filter((c) => c._id !== courseId) || []);
          }
        })
        .catch((error) => {
          console.error("Error fetching related courses:", error);
        });
    });

    // Enrollment and wishlist (if logged in)
    if (session) {
      fetch(`/api/enrollments?courseId=${courseId}`)
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              setIsEnrolled(true);
              setEnrollmentId(data.data[0]._id);
            }
          }
        })
        .catch((error) => {
          console.error("Error checking enrollment:", error);
        });

      fetch("/api/wishlist")
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            const isInWishlist = data.data?.some((item) => item.course._id === courseId);
            setWishlist(isInWishlist);
          }
        })
        .catch((error) => {
          console.error("Error checking wishlist:", error);
        });
    }

    // Wait for main data, then set loading false
    Promise.all([coursePromise, lessonsPromise, reviewsPromise]).finally(() => {
      setLoading(false);
    });
  }, [courseId, session]);


  const handleEnroll = async () => {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (course.price > 0) {
      // Redirect to checkout for paid courses
      router.push(`/courses/${courseId}/checkout`);
      return;
    }

    // Free enrollment
    setEnrolling(true);
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsEnrolled(true);
        setEnrollmentId(data.data._id);
        toast.success("Successfully enrolled in course!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to enroll");
      }
    } catch (error) {
      console.error("Error enrolling:", error);
      toast.error("Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  const toggleWishlist = async () => {
    if (!session) {
      router.push("/signin");
      return;
    }

    try {
      const method = wishlist ? "DELETE" : "POST";
      const response = await fetch("/api/wishlist", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        setWishlist(!wishlist);
        toast.success(wishlist ? "Removed from wishlist" : "Added to wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Course Not Found</h2>
            <p className="text-gray-600 mb-4">
              The course you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8">
      {/* Course Hero - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs sm:text-sm">{course.category}</Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">{course.level}</Badge>
              {course.isFeatured && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">
                  Featured
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              {course.shortDescription}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{course.instructor?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span>{course.enrollmentCount || 0} students</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>{lessons.length} lessons</span>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(course.avgRating || 0)}
                <span>({course.reviewCount || 0})</span>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80">
              <Image
                src={course.thumbnail || "/placeholder-course.jpg"}
                alt={course.title}
                fill
                className="object-cover"
              />
              {!isEnrolled && lessons.length > 0 && lessons[0].isPreview && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    <Link
                      href={`/courses/${courseId}/learn?lesson=${lessons[0]._id}&preview=true`}
                    >
                      <Play className="h-6 w-6 mr-2" />
                      Preview Course
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>        {/* Course Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                  {course.price === 0 ? "Free" : `₹${course.price}`}
                </div>
                {course.originalPrice &&
                  course.originalPrice > course.price && (
                    <div className="text-sm text-gray-500 line-through">
                      ₹{course.originalPrice}
                    </div>
                  )}
              </div>

              <div className="space-y-2">
                {isEnrolled ? (
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/courses/${courseId}/learn`}>
                      <Play className="h-5 w-5 mr-2" />
                      Continue Learning
                    </Link>
                  </Button>
                ) : (
                  <Button
                    onClick={handleEnroll}
                    className="w-full"
                    size="lg"
                    disabled={enrolling}
                  >
                    {enrolling
                      ? "Enrolling..."
                      : course.price === 0
                      ? "Enroll Free"
                      : "Buy Now"}
                  </Button>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={toggleWishlist}
                  >
                    <Heart
                      className={`h-4 w-4 mr-1 ${
                        wishlist ? "fill-current text-red-500" : ""
                      }`}
                    />
                    {wishlist ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span>{course.duration || "Self-paced"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="capitalize">{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Language</span>
                  <span>English</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Access</span>
                  <span>Lifetime</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">This course includes:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Play className="h-4 w-4 mr-2" />
                    {lessons.length} video lessons
                  </div>
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Downloadable resources
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Lifetime access
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Certificate of completion
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content Tabs - Mobile Optimized */}
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto min-w-full sm:min-w-0 grid grid-cols-4 sm:inline-flex">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="curriculum" className="text-xs sm:text-sm">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor" className="text-xs sm:text-sm">Instructor</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm">Reviews</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About This Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </CardContent>
          </Card>

          {course.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {course.learningOutcomes && (
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Course Content</CardTitle>
              <CardDescription>
                {lessons.length} lessons • {course.duration || "Self-paced"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4"
                  >
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 mt-0.5 sm:mt-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base line-clamp-1 sm:line-clamp-none">{lesson.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">
                          {lesson.description}
                        </p>
                        <div className="flex items-center space-x-3 sm:space-x-4 mt-1 sm:mt-2 text-xs text-gray-500">
                          <span className="capitalize">{lesson.type}</span>
                          {lesson.duration && (
                            <span>{lesson.duration} min</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 self-start sm:self-center">
                      {lesson.isPreview ? (
                        <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
                          <Link
                            href={`/courses/${courseId}/learn?lesson=${lesson._id}&preview=true`}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Preview
                          </Link>
                        </Button>
                      ) : isEnrolled ? (
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/courses/${courseId}/learn?lesson=${lesson._id}`}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Watch
                          </Link>
                        </Button>
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructor">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Image
                  src={course.instructor?.image || "https://avatar.vercel.sh/svnm"}
                  alt={course.instructor?.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    {course.instructor?.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {course.instructor?.title || "Course Instructor"}
                  </p>
                  <p className="text-gray-700">
                    {course.instructor?.bio ||
                      "Experienced instructor with expertise in this field."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-6">
            {/* Reviews Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      {course.avgRating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      {renderStars(course.avgRating || 0)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {course.reviewCount || 0} reviews
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={review.user?.image || "/default-avatar.png"}
                        alt={review.user?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{review.user?.name}</h4>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                          <button className="flex items-center space-x-1 hover:text-blue-600">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Helpful</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Courses - Mobile Optimized */}
      {relatedCourses.length > 0 && (
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold">Related Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedCourses.map((relatedCourse) => (
              <Card
                key={relatedCourse._id}
                className="hover:shadow-lg transition-shadow"
              >
                <Link href={`/courses/${relatedCourse._id}`}>
                  <div className="relative w-full h-32 overflow-hidden rounded-t-lg">
                    <Image
                      src={relatedCourse.thumbnail || "/placeholder-course.jpg"}
                      alt={relatedCourse.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="font-medium line-clamp-2 mb-2 text-sm sm:text-base">
                      {relatedCourse.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 truncate">
                        {relatedCourse.instructor?.name}
                      </span>
                      <span className="font-bold text-blue-600 flex-shrink-0 ml-2">
                        {relatedCourse.price === 0
                          ? "Free"
                          : `₹${relatedCourse.price}`}
                      </span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

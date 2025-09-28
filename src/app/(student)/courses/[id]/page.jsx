"use client";

import { useSession } from "next-auth/react";
import { use } from "react";

// Import modular components
import LoadingState from "./components/LoadingState";
import NotFoundState from "./components/NotFoundState";
import CourseHero from "./components/CourseHero";
import CoursePreview from "./components/CoursePreview";
import CourseSidebar from "./components/CourseSidebar";
import CourseContentTabs from "./components/CourseContentTabs";
import RelatedCourses from "./components/RelatedCourses";

// Import custom hooks
import { useCourseData } from "./hooks/useCourseData";
import { useCourseActions } from "./hooks/useCourseActions";

export default function CourseDetailPage({ params }) {
  const { data: session, status } = useSession();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  // Use custom hooks for data and actions
  const {
    course,
    lessons,
    isEnrolled,
    enrollmentId,
    loading,
    relatedCourses,
    reviews,
    wishlist,
    setIsEnrolled,
    setEnrollmentId,
    setWishlist,
  } = useCourseData(courseId, session);

  const {
    enrolling,
    handleEnroll,
    toggleWishlist,
  } = useCourseActions(courseId, session);

  // Loading and error states
  if (loading) {
    return <LoadingState />;
  }

  if (!course) {
    return <NotFoundState />;
  }

  // Wrapper functions for actions
  const handleEnrollWrapper = () => handleEnroll(course, setIsEnrolled, setEnrollmentId);
  const handleWishlistWrapper = () => toggleWishlist(wishlist, setWishlist);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8">
      {/* Course Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <CourseHero course={course} lessons={lessons} />
          <CoursePreview 
            course={course} 
            courseId={courseId} 
            isEnrolled={isEnrolled} 
            lessons={lessons} 
          />
        </div>

        <CourseSidebar 
          course={course}
          courseId={courseId}
          isEnrolled={isEnrolled}
          enrolling={enrolling}
          wishlist={wishlist}
          lessons={lessons}
          handleEnroll={handleEnrollWrapper}
          toggleWishlist={handleWishlistWrapper}
        />
      </div>

      {/* Course Content Tabs */}
      <CourseContentTabs 
        course={course}
        lessons={lessons}
        courseId={courseId}
        isEnrolled={isEnrolled}
        reviews={reviews}
      />

      {/* Related Courses */}
      <RelatedCourses relatedCourses={relatedCourses} />
    </div>
  );
}




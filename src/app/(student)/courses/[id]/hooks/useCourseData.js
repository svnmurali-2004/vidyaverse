import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function useCourseData(courseId, session) {
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseData = async () => {
      setLoading(true);

      try {
        // Fetch all main data in parallel
        const coursePromise = fetch(`/api/courses/${courseId}?includeDetails=true`).then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            setCourse(data.data);
            return data.data;
          } else {
            toast.error("Course not found");
            router.push("/courses");
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

        // Wait for course data first, then fetch related courses
        const courseData = await coursePromise;
        await Promise.all([lessonsPromise, reviewsPromise]);

        if (courseData) {
          // Fetch related courses
          try {
            const response = await fetch(`/api/courses?limit=4&category=${courseData.category}`);
            if (response.ok) {
              const data = await response.json();
              setRelatedCourses(data.data?.filter(c => c._id !== courseId) || []);
            }
          } catch (error) {
            console.error("Error fetching related courses:", error);
          }
        }

        // Check enrollment status if user is logged in
        if (session?.user) {
          try {
            const enrollmentResponse = await fetch(`/api/enrollments?courseId=${courseId}`);
            if (enrollmentResponse.ok) {
              const enrollmentData = await enrollmentResponse.json();
              const enrollment = enrollmentData.data?.find(e => e.course === courseId || e.course._id === courseId);
              if (enrollment) {
                setIsEnrolled(true);
                setEnrollmentId(enrollment._id);
              }
            }
          } catch (error) {
            console.error("Error checking enrollment:", error);
          }

          // Check wishlist status
          try {
            const wishlistResponse = await fetch(`/api/wishlist`);
            if (wishlistResponse.ok) {
              const wishlistData = await wishlistResponse.json();
              const isInWishlist = wishlistData.data?.some(w => w.course._id === courseId);
              setWishlist(isInWishlist);
            }
          } catch (error) {
            console.error("Error checking wishlist:", error);
          }
        }
      } catch (error) {
        console.error("Error in fetchCourseData:", error);
        toast.error("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, session, router]);

  return {
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
  };
}
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function useCourseActions(courseId, session) {
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async (course, setIsEnrolled, setEnrollmentId) => {
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

  const toggleWishlist = async (wishlist, setWishlist) => {
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
      } else {
        toast.error("Failed to update wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  return {
    enrolling,
    handleEnroll,
    toggleWishlist,
  };
}
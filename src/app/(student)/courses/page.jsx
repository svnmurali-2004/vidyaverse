"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CoursesHero,
  FeaturedCourses,
  CourseFilters,
  CoursesGrid,
  CoursesPagination,
  CoursesEmptyState,
  CoursesLoading,
} from "./components";

export default function CoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [priceFilter, setPriceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchFeaturedCourses();
    if (session) {
      fetchWishlist();
    }
  }, [
    searchTerm,
    categoryFilter,
    levelFilter,
    sortBy,
    priceFilter,
    currentPage,
    session,
  ]);

  // Refetch data when user returns to the page (after payment, etc.)
  useEffect(() => {
    const handleFocus = () => {
      // Small delay to ensure any background API calls have completed
      setTimeout(() => {
        fetchCourses();
        if (session) {
          fetchWishlist();
        }
      }, 1000);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [session]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        category: categoryFilter !== "all" ? categoryFilter : "",
        level: levelFilter !== "all" ? levelFilter : "",
        sortBy,
        published: "true",
        page: currentPage.toString(),
        limit: "12",
      });

      if (priceFilter === "free") {
        params.append("price", "0");
      } else if (priceFilter === "paid") {
        params.append("minPrice", "1");
      }

      const response = await fetch(`/api/courses?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCourses = async () => {
    try {
      const response = await fetch("/api/courses?featured=true&limit=6");
      if (response.ok) {
        const data = await response.json();
        setFeaturedCourses(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching featured courses:", error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/users/wishlist");
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const toggleWishlist = async (courseId) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const isInWishlist = wishlist.includes(courseId);
      const response = await fetch("/api/users/wishlist", {
        method: isInWishlist ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        setWishlist((prev) =>
          isInWishlist
            ? prev.filter((id) => id !== courseId)
            : [...prev, courseId]
        );
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const enrollInCourse = async (courseId, isFree) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      if (isFree) {
        const response = await fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });

        if (response.ok) {
          router.push(`/courses/${courseId}/learn`);
        } else {
          const error = await response.json();
          alert(error.error || "Failed to enroll");
        }
      } else {
        router.push(`/courses/${courseId}/checkout`);
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      alert("Failed to enroll in course");
    }
  };

  // Helper functions
  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setLevelFilter("all");
    setPriceFilter("all");
    setCurrentPage(1);
  };

  const handleQuickPreview = (course) => {
    router.push(`/courses/${course._id}`);
  };

  const hasActiveFilters = searchTerm || categoryFilter !== "all" || 
                          levelFilter !== "all" || priceFilter !== "all";

  if (loading) {
    return <CoursesLoading />;
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <CoursesHero />
      
      <FeaturedCourses
        featuredCourses={featuredCourses}
        wishlist={wishlist}
        onToggleWishlist={toggleWishlist}
      />
      
      <CourseFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        onClearFilters={clearFilters}
      />

      {courses.length > 0 ? (
        <>
          <CoursesGrid
            courses={courses}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onQuickPreview={handleQuickPreview}
          />
          
          <CoursesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <CoursesEmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      )}
    </div>
  );
}
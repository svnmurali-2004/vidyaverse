"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Components
import CoursesHero from "./components/CoursesHero";
import CoursesFilters from "./components/CoursesFilters";
import CoursesGrid from "./components/CoursesGrid";
import CoursesPagination from "./components/CoursesPagination";

export default function CoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // State management
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
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Effects
  useEffect(() => {
    // Debounce the API calls to prevent too many requests
    const timeoutId = setTimeout(() => {
      fetchCourses();
    }, searchTerm ? 500 : 0); // 500ms delay for search, immediate for others

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    categoryFilter,
    levelFilter,
    sortBy,
    priceFilter,
    currentPage,
  ]);

  // Separate effect for featured courses and wishlist (less frequent updates)
  useEffect(() => {
    fetchFeaturedCourses();
    if (session) {
      fetchWishlist();
    }
  }, [session]);

  // Refetch data when user returns to the page (after payment, etc.)
  useEffect(() => {
    const handleFocus = () => {
      setTimeout(() => {
        fetchCourses();
        if (session) {
          fetchWishlist();
        }
      }, 1000);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // API Functions
  const fetchCourses = async (retry = 0) => {
    try {
      setLoading(true);
      setError(null);
      
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

      console.log("Fetching courses with params:", params.toString());
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`/api/courses?${params}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      clearTimeout(timeoutId);
      console.log("Courses API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Courses API response data:", data);
      
      if (data.success) {
        setCourses(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        console.log("Set courses count:", data.data?.length || 0);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(data.error || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError(error.message);
      
      // Retry logic for network errors
      if (retry < 2 && (error.name === 'AbortError' || error.message.includes('fetch'))) {
        console.log(`Retrying course fetch, attempt ${retry + 1}...`);
        setTimeout(() => fetchCourses(retry + 1), 1000 * (retry + 1));
        return;
      }
      
      setCourses([]);
      setRetryCount(retry);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCourses = async (retry = 0) => {
    try {
      console.log("Fetching featured courses...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch("/api/courses?featured=true&limit=6", {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      clearTimeout(timeoutId);
      console.log("Featured courses API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Featured courses API response data:", data);
      
      if (data.success) {
        setFeaturedCourses(data.data || []);
        console.log("Set featured courses count:", data.data?.length || 0);
      } else {
        throw new Error(data.error || "Failed to fetch featured courses");
      }
    } catch (error) {
      console.error("Error fetching featured courses:", error);
      
      // Retry logic for network errors
      if (retry < 2 && (error.name === 'AbortError' || error.message.includes('fetch'))) {
        console.log(`Retrying featured courses fetch, attempt ${retry + 1}...`);
        setTimeout(() => fetchFeaturedCourses(retry + 1), 1000 * (retry + 1));
        return;
      }
      
      setFeaturedCourses([]);
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
      setWishlist([]);
    }
  };

  // Event Handlers
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

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setLevelFilter("all");
    setPriceFilter("all");
    setSortBy("createdAt");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  console.log("Main page render - loading:", loading, "courses:", courses?.length, "featured:", featuredCourses?.length);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Discover Courses
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
                Expand your skills with our comprehensive course library
              </p>
            </div>
            <button
              onClick={() => {
                fetchCourses();
                fetchFeaturedCourses();
              }}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Featured Courses Section */}
        <CoursesHero
          featuredCourses={featuredCourses}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onEnroll={enrollInCourse}
          loading={loading}
        />

        {/* Error Message with Retry */}
        {error && !loading && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Failed to load courses
                </h3>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {error} {retryCount > 0 && `(Retry attempts: ${retryCount})`}
                </p>
              </div>
              <button
                onClick={() => fetchCourses()}
                className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <CoursesFilters
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          levelFilter={levelFilter}
          sortBy={sortBy}
          priceFilter={priceFilter}
          onSearchChange={setSearchTerm}
          onCategoryChange={setCategoryFilter}
          onLevelChange={setLevelFilter}
          onSortChange={setSortBy}
          onPriceFilterChange={setPriceFilter}
          onClearFilters={handleClearFilters}
        />

        {/* Courses Grid */}
        <div className="mt-8">
          <CoursesGrid
            courses={courses}
            wishlist={wishlist}
            loading={loading}
            onToggleWishlist={toggleWishlist}
            onEnroll={enrollInCourse}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Pagination */}
        <CoursesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
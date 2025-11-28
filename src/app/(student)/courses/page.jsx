"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

// Components
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

  // Separate effect for wishlist
  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">
                Discover Courses
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Expand your skills with our comprehensive course library
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                fetchCourses();
              }}
              disabled={loading}
              className="gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Error Message with Retry */}
        {error && !loading && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="text-sm font-medium text-destructive">
                    Failed to load courses
                  </h3>
                  <p className="text-xs text-destructive/80 mt-1">
                    {error} {retryCount > 0 && `(Retry attempts: ${retryCount})`}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => fetchCourses()}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <CoursesFilters
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          levelFilter={levelFilter}
          sortBy={sortBy}
          priceFilter={priceFilter}ll
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
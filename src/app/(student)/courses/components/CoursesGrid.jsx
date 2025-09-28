"use client";

import CourseCard from "./CourseCard";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoursesGrid({
  courses,
  wishlist,
  loading,
  onToggleWishlist,
  onEnroll,
  onClearFilters
}) {
  console.log("CoursesGrid - loading:", loading, "courses count:", courses?.length || 0);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden animate-pulse"
            >
              {/* Image skeleton */}
              <div className="h-48 bg-gray-200 dark:bg-gray-700" />
              
              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No courses found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-base mb-8 max-w-md mx-auto">
          We couldn't find any courses matching your criteria. Try adjusting your filters or browse our featured courses.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onClearFilters} variant="outline">
            Clear All Filters
          </Button>
          <Button asChild>
            <a href="#featured-courses">Browse Featured Courses</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="transform transition-all duration-200 hover:scale-[1.02]"
          >
            <CourseCard
              course={course}
              wishlist={wishlist}
              onToggleWishlist={onToggleWishlist}
              onEnroll={onEnroll}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
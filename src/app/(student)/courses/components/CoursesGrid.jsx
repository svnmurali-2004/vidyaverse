"use client";

import CourseCard from "./CourseCard";
import { BookOpen, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-pulse h-[380px]"
            >
              {/* Image skeleton */}
              <div className="h-48 bg-slate-200 dark:bg-slate-800" />

              {/* Content skeleton */}
              <div className="p-4 space-y-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />

                <div className="flex justify-between items-center pt-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                  <div className="flex gap-2">
                    <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded w-24" />
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-24 px-4"
      >
        <div className="mx-auto w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-200 dark:border-slate-800">
          <SearchX className="h-12 w-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          No courses found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
          We couldn't find any courses matching your current filters. Try adjusting your search or filters to find what you're looking for.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="h-12 px-8 rounded-full border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Clear All Filters
          </Button>
          <Button
            asChild
            className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            <a href="#featured-courses">Browse Featured</a>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Showing <span className="text-slate-900 dark:text-white font-bold">{courses.length}</span> course{courses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <CourseCard
              course={course}
              wishlist={wishlist}
              onToggleWishlist={onToggleWishlist}
              onEnroll={onEnroll}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CourseCard from "./CourseCard";
import { ChevronLeft, ChevronRight, Star, Sparkles } from "lucide-react";

export default function CoursesHero({
  featuredCourses,
  wishlist,
  onToggleWishlist,
  onEnroll,
  loading
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const scrollToNext = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0]?.offsetWidth || 0;
      const gap = 24; // gap-6 = 24px
      const scrollAmount = cardWidth + gap;
      
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollToPrev = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0]?.offsetWidth || 0;
      const gap = 24; // gap-6 = 24px
      const scrollAmount = cardWidth + gap;
      
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="mb-12">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-8" />
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-80 h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredCourses || featuredCourses.length === 0) {
    return null;
  }

  return (
    <section id="featured-courses" className="mb-12">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/10 rounded-full blur-xl" />
        
        {/* Header */}
        <div className="relative z-10 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">
              Featured
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🌟 Featured Courses
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
            Hand-picked courses that are trending and highly rated by our community
          </p>
        </div>

        {/* Courses Carousel */}
        <div className="relative">
          {/* Navigation Buttons - Hidden on Mobile */}
          {featuredCourses.length > 3 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-black hidden md:flex"
                onClick={scrollToPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-black hidden md:flex"
                onClick={scrollToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Courses Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto md:overflow-x-hidden scrollbar-hide pb-4 md:pb-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredCourses.map((course) => (
              <div
                key={course._id}
                className="min-w-[280px] md:min-w-[320px] flex-shrink-0"
              >
                <CourseCard
                  course={course}
                  wishlist={wishlist}
                  onToggleWishlist={onToggleWishlist}
                  onEnroll={onEnroll}
                  isFeatured={true}
                />
              </div>
            ))}
          </div>

          {/* Mobile Scroll Indicator */}
          <div className="flex justify-center mt-4 md:hidden">
            <div className="flex gap-1">
              {featuredCourses.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {featuredCourses.reduce((acc, course) => acc + (course.enrollmentCount || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Students Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
              <Star className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400" />
              {(featuredCourses.reduce((acc, course) => acc + (course.avgRating || 0), 0) / featuredCourses.length).toFixed(1)}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {featuredCourses.filter(course => course.price === 0).length}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Free Courses</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {featuredCourses.length}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Featured Courses</div>
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CourseCard from "./CourseCard";
import { ChevronLeft, ChevronRight, Star, Sparkles, TrendingUp } from "lucide-react";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";

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
      <section className="mb-12 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="h-[500px] bg-slate-50 dark:bg-slate-900/50 p-12 animate-pulse flex flex-col justify-center">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-6" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-96 mb-4" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-72 mb-8" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-full max-w-2xl mb-12" />

          <div className="flex gap-6 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="min-w-[300px] h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
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
    <section id="featured-courses" className="mb-12 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
      <HeroHighlight containerClassName="h-auto min-h-[500px] items-start py-12">
        <div className="relative z-10 w-full px-6 md:px-10">

          {/* Header */}
          <div className="mb-10 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">
                Hand-Picked For You
              </span>
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Discover Our <br />
              <Highlight className="text-black dark:text-white">
                Featured Courses
              </Highlight>
            </h2>

            <TextGenerateEffect
              words="Explore top-rated courses selected by our experts to help you master new skills and advance your career."
              className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-normal"
            />
          </div>

          {/* Courses Carousel */}
          <div className="relative">
            {/* Navigation Buttons - Hidden on Mobile */}
            {featuredCourses.length > 3 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 hidden md:flex h-12 w-12 rounded-full"
                  onClick={scrollToPrev}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 hidden md:flex h-12 w-12 rounded-full"
                  onClick={scrollToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Courses Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto md:overflow-x-hidden scrollbar-hide pb-8 pt-4 px-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="min-w-[280px] md:min-w-[340px] flex-shrink-0"
                >
                  <CourseCard
                    course={course}
                    wishlist={wishlist}
                    onToggleWishlist={onToggleWishlist}
                    onEnroll={onEnroll}
                    isFeatured={true}
                  />
                </motion.div>
              ))}
            </div>

            {/* Mobile Scroll Indicator */}
            <div className="flex justify-center mt-4 md:hidden">
              <div className="flex gap-1">
                {featuredCourses.map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {featuredCourses.reduce((acc, course) => acc + (course.enrollmentCount || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Students Enrolled</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-400">
                <Star className="h-6 w-6 fill-current" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {(featuredCourses.reduce((acc, course) => acc + (course.avgRating || 0), 0) / featuredCourses.length).toFixed(1)}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Average Rating</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {featuredCourses.filter(course => course.price === 0).length}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Free Courses</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                <Badge className="bg-purple-600 hover:bg-purple-700 h-6 w-6 p-0 flex items-center justify-center rounded-full">
                  {featuredCourses.length}
                </Badge>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  Total
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Featured Courses</div>
              </div>
            </div>
          </div>
        </div>
      </HeroHighlight>
    </section>
  );
}
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Users,
  User,
  Clock,
  BookOpen,
  Play,
  Eye,
  Heart,
  Award,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function CourseCard({
  course,
  wishlist,
  onToggleWishlist,
  onEnroll,
  isFeatured = false
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <Card className={`
      h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-slate-200 dark:border-slate-800
      ${isFeatured
        ? 'ring-2 ring-yellow-400/20 dark:ring-yellow-500/20'
        : 'hover:border-blue-200 dark:hover:border-blue-800'
      }
    `}>
      <div className="relative group h-48 flex-shrink-0">
        {/* Course Thumbnail */}
        {course.thumbnail ? (
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={course.thumbnail}
              alt={course.title}
              className={`
                w-full h-full object-cover transition-transform duration-700 
                ${isImageLoaded ? 'scale-100' : 'scale-110'} 
                group-hover:scale-110
              `}
              onLoad={handleImageLoad}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center animate-pulse">
                <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Featured Badge */}
          {(isFeatured || course.isFeatured) && !course.isEnrolled && (
            <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 shadow-sm backdrop-blur-sm">
              <Award className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}

          {/* Enrolled Badge */}
          {course.isEnrolled && (
            <Badge className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm backdrop-blur-sm">
              <Award className="h-3 w-3 mr-1" />
              Enrolled
            </Badge>
          )}
        </div>

        {/* Level Badge */}
        <Badge
          className={`absolute top-3 right-12 shadow-sm backdrop-blur-sm ${course.level === "beginner"
              ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
              : course.level === "advanced"
                ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
            }`}
          variant="outline"
        >
          {course.level}
        </Badge>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black backdrop-blur-md shadow-sm rounded-full transition-all duration-200 hover:scale-110"
          onClick={() => onToggleWishlist(course._id)}
        >
          <Heart
            className={`h-4 w-4 transition-colors duration-200 ${wishlist.includes(course._id)
                ? "fill-red-500 text-red-500"
                : "text-slate-600 dark:text-slate-300 hover:text-red-500"
              }`}
          />
        </Button>

        {/* Course Duration Overlay */}
        {course.duration && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center backdrop-blur-md border border-white/10">
            <Clock className="h-3 w-3 mr-1.5" />
            {course.duration}
          </div>
        )}
      </div>

      {/* Card Content */}
      <CardHeader className="pb-3 flex-grow">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            {course.category && (
              <span className="font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                {course.category}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-slate-900 dark:text-white">{course.avgRating?.toFixed(1) || "New"}</span>
              {course.reviewCount > 0 && (
                <span>({course.reviewCount})</span>
              )}
            </div>
          </div>

          <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {course.title}
          </CardTitle>

          <CardDescription className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {course.shortDescription || course.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0 mt-auto">
        <div className="space-y-4">
          {/* Instructor & Students */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            {course.instructor && (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {course.instructor.image ? (
                    <img src={course.instructor.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                </div>
                <span className="truncate max-w-[100px]">{course.instructor.name || course.instructor}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{course.enrollmentCount || 0} students</span>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between gap-3">
            {/* Price Section */}
            {!course.isEnrolled && (
              <div className="flex-shrink-0">
                {course.price === 0 ? (
                  <span className="text-green-600 dark:text-green-400 font-bold text-lg">Free</span>
                ) : (
                  <span className="text-slate-900 dark:text-white font-bold text-xl">
                    ₹{course.price?.toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex gap-2 ${course.isEnrolled ? 'w-full' : 'flex-1 justify-end'}`}>
              {course.isEnrolled ? (
                <Button
                  size="sm"
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Link href={`/courses/${course._id}/learn`}>
                    <Play className="h-4 w-4 mr-2" />
                    Continue
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                    className="h-9 w-9 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Link href={`/courses/${course._id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onEnroll(course._id, course.price === 0)}
                    className={`flex-1 shadow-md hover:shadow-lg transition-all duration-200 ${course.price === 0
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                  >
                    {course.price === 0 ? "Start Free" : "Enroll Now"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar (if enrolled) */}
          {course.isEnrolled && course.progress !== undefined && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">Progress</span>
                <span className="text-blue-600 dark:text-blue-400">{Math.round(course.progress)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
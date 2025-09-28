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
} from "lucide-react";

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
      overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 
      ${isFeatured 
        ? 'border-yellow-200 dark:border-yellow-800 ring-2 ring-yellow-100 dark:ring-yellow-900' 
        : 'hover:border-primary/50'
      }
    `}>
      <div className="relative group">
        {/* Course Thumbnail */}
        {course.thumbnail ? (
          <div className="relative overflow-hidden">
            <img
              src={course.thumbnail}
              alt={course.title}
              className={`
                w-full h-48 object-cover transition-all duration-500 
                ${isImageLoaded ? 'scale-100' : 'scale-110'} 
                group-hover:scale-105
              `}
              onLoad={handleImageLoad}
            />
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center animate-pulse">
                <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
        )}

        {/* Featured Badge - only show if not enrolled */}
        {(isFeatured || course.isFeatured) && !course.isEnrolled && (
          <Badge className="absolute top-3 left-3 bg-yellow-500 text-black shadow-md">
            <Award className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}

        {/* Enrolled Badge - takes priority over Featured */}
        {course.isEnrolled && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md border-0">
            <Award className="h-3 w-3 mr-1" />
            Enrolled
          </Badge>
        )}

        {/* Featured Badge for enrolled courses - show in bottom left */}
        {(isFeatured || course.isFeatured) && course.isEnrolled && (
          <Badge className="absolute bottom-3 left-3 bg-yellow-500 text-black shadow-md">
            <Award className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}

        {/* Level Badge */}
        <Badge
          className="absolute top-3 right-12 shadow-md"
          variant={
            course.level === "beginner"
              ? "secondary"
              : course.level === "advanced"
              ? "destructive"
              : "default"
          }
        >
          {course.level}
        </Badge>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black backdrop-blur-sm shadow-md transition-all duration-200 hover:scale-110"
          onClick={() => onToggleWishlist(course._id)}
        >
          <Heart
            className={`h-4 w-4 transition-colors duration-200 ${
              wishlist.includes(course._id)
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-400"
            }`}
          />
        </Button>

        {/* Course Duration Overlay */}
        {course.duration && (
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center backdrop-blur-sm">
            <Clock className="h-3 w-3 mr-1" />
            {course.duration}
          </div>
        )}
      </div>

      {/* Card Content */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {course.title}
          </CardTitle>
        </div>
        <CardDescription className="line-clamp-2 text-sm">
          {course.shortDescription || course.description}
        </CardDescription>
        
        {/* Instructor */}
        {course.instructor && (
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            {course.instructor.name || course.instructor}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{course.enrollmentCount || 0} students</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
              <span>{course.avgRating?.toFixed(1) || "New"}</span>
              {course.reviewCount && (
                <span className="ml-1">({course.reviewCount})</span>
              )}
            </div>
          </div>

          {/* Category */}
          {course.category && (
            <div className="text-xs text-muted-foreground">
              Category: <span className="font-medium">{course.category}</span>
            </div>
          )}

          {/* Price and Actions */}
          <div className="flex flex-col gap-3 mt-4">
            {/* Price Section - Only show for non-enrolled courses */}
            {!course.isEnrolled && (
              <div className="flex items-center justify-center sm:justify-start">
                {course.price === 0 ? (
                  <span className="inline-flex items-center text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1.5 rounded-full">
                    Free Course
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{course.price?.toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {/* Main Action Button */}
              {course.isEnrolled ? (
                <Button 
                  size="sm" 
                  asChild 
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                >
                  <Link href={`/courses/${course._id}/learn`}>
                    <Play className="h-4 w-4" />
                    <span>Continue</span>
                  </Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onEnroll(course._id, course.price === 0)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    course.price === 0
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  {course.price === 0 ? (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Start Free</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4" />
                      <span>Enroll</span>
                    </>
                  )}
                </Button>
              )}

              {/* View Details Button */}
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <Link href={`/courses/${course._id}`}>
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Progress Bar (if enrolled) */}
          {course.isEnrolled && course.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(course.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
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
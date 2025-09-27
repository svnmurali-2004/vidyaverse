import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  isFeatured = false, 
  wishlist = [], 
  onToggleWishlist,
  onQuickPreview 
}) {
  const isInWishlist = wishlist.includes(course._id);

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow ${
        isFeatured ? "border-yellow-200 dark:border-yellow-800" : ""
      }`}
    >
      <div className="relative">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className={`w-full h-48 bg-gradient-to-br flex items-center justify-center ${
            isFeatured 
              ? "from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800" 
              : "from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800"
          }`}>
            <BookOpen className={`h-16 w-16 ${
              isFeatured 
                ? "text-yellow-600 dark:text-yellow-400" 
                : "text-blue-600 dark:text-blue-400"
            }`} />
          </div>
        )}
        
        {isFeatured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">
            <Award className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={() => onToggleWishlist(course._id)}
        >
          <Heart
            className={`h-4 w-4 ${
              isInWishlist
                ? "fill-red-500 text-red-500"
                : "text-gray-600"
            }`}
          />
        </Button>
      </div>

      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.shortDescription || course.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              {course.enrollmentCount || 0}
            </div>
            <div className="flex items-center text-gray-500">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              {course.averageRating ? course.averageRating.toFixed(1) : "New"}
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <User className="h-4 w-4 mr-1" />
            {course.instructor?.name || "VidyaVerse"}
          </div>

          {/* Duration */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration || "Self-paced"}
          </div>

          {/* Rating */}
          {course.averageRating > 0 && (
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.floor(course.averageRating)
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-1">
                ({course.reviewCount || 0} reviews)
              </span>
            </div>
          )}

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {course.price === 0 ? (
                <span className="text-2xl font-bold text-green-600">Free</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{course.price}
                  </span>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{course.originalPrice}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {onQuickPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickPreview(course)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              )}
              <Button asChild size="sm">
                <Link href={`/courses/${course._id}`}>
                  <Play className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
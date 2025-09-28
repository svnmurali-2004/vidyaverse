import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Heart, 
  Share2, 
  Clock, 
  Download, 
  Globe, 
  Award 
} from "lucide-react";

export default function CourseSidebar({ 
  course, 
  courseId, 
  isEnrolled, 
  enrolling, 
  wishlist, 
  lessons,
  handleEnroll,
  toggleWishlist 
}) {
  return (
    <div className="lg:sticky lg:top-4 lg:self-start">
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Price Section */}
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
              {course.price === 0 ? "Free" : `₹${course.price}`}
            </div>
            {course.originalPrice && course.originalPrice > course.price && (
              <div className="text-sm text-gray-500 line-through">
                ₹{course.originalPrice}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isEnrolled ? (
              <Button asChild className="w-full" size="lg">
                <Link href={`/courses/${courseId}/learn`}>
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Continue Learning
                </Link>
              </Button>
            ) : (
              <Button
                onClick={handleEnroll}
                className="w-full"
                size="lg"
                disabled={enrolling}
              >
                {enrolling
                  ? "Enrolling..."
                  : course.price === 0
                  ? "Enroll Free"
                  : "Buy Now"}
              </Button>
            )}

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleWishlist}
                className="flex-1"
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    wishlist ? "fill-current text-red-500" : ""
                  }`}
                />
                {wishlist ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Course Features */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">This course includes:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Play className="h-4 w-4 mr-2" />
                {lessons.length} video lessons
              </div>
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Downloadable resources
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Lifetime access
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Certificate of completion
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
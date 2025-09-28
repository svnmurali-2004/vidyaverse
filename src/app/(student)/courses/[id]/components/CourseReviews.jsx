import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp } from "lucide-react";
import StarRating from "./StarRating";

export default function CourseReviews({ course, reviews }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="text-center sm:text-left">
              <div className="text-3xl sm:text-4xl font-bold">
                {course.avgRating?.toFixed(1) || "0.0"}
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-1 mt-1">
                <StarRating rating={course.avgRating || 0} />
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {course.reviewCount || 0} reviews
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 flex-shrink-0">
                    <Image
                      src={review.user?.image || "/default-avatar.png"}
                      alt={review.user?.name || "Reviewer"}
                      width={40}
                      height={40}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="font-medium text-sm sm:text-base">
                        {review.user?.name || "Anonymous"}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <StarRating rating={review.rating} size="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2 text-sm sm:text-base leading-relaxed">
                      {review.comment}
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-xs sm:text-sm text-gray-500">
                      <span>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Helpful</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
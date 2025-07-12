"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Star, ThumbsUp, User, Calendar, MessageSquare } from "lucide-react";

export default function CourseReviews({ courseId }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);

        // Check if user has already reviewed
        const userReviewFound = data.reviews?.find(
          (review) => review.user?._id === session?.user?.id
        );
        setUserReview(userReviewFound);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!session) {
      toast.error("Please sign in to submit a review");
      return;
    }

    if (!reviewData.comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course: courseId,
          rating: reviewData.rating,
          comment: reviewData.comment.trim(),
        }),
      });

      if (response.ok) {
        toast.success("Review submitted successfully");
        setShowReviewForm(false);
        setReviewData({ rating: 5, comment: "" });
        fetchReviews();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() =>
              interactive && onRatingChange && onRatingChange(star)
            }
            className={`${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((review) => review.rating === rating).length /
            reviews.length) *
          100
        : 0,
  }));

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Course Reviews
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center lg:text-left">
              <div className="mb-4">
                <div className="text-4xl font-bold mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center lg:justify-start mb-2">
                  {renderStars(Math.round(averageRating))}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Based on {reviews.length} review
                  {reviews.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm font-medium w-8">{rating}★</span>
                  <Progress value={percentage} className="flex-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Form Toggle */}
          {session && !userReview && (
            <div className="mt-6 pt-6 border-t">
              {!showReviewForm ? (
                <Button onClick={() => setShowReviewForm(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Write Your Review</h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rating
                    </label>
                    {renderStars(reviewData.rating, true, (rating) =>
                      setReviewData({ ...reviewData, rating })
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Review
                    </label>
                    <Textarea
                      value={reviewData.comment}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          comment: e.target.value,
                        })
                      }
                      placeholder="Share your experience with this course..."
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={submitReview} disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewData({ rating: 5, comment: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User's existing review */}
          {userReview && (
            <div className="mt-6 pt-6 border-t">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Your Review</h3>
                <div className="flex items-center space-x-2 mb-2">
                  {renderStars(userReview.rating)}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(userReview.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {userReview.comment}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Reviews ({reviews.length})</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border-b last:border-b-0 pb-6 last:pb-0"
                >
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">
                            {review.user?.name || "Anonymous"}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <Badge variant="outline">Verified Purchase</Badge>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {review.comment}
                      </p>

                      {/* Review Actions */}
                      <div className="flex items-center space-x-4 mt-3 text-sm">
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                          <ThumbsUp className="h-4 w-4" />
                          <span>Helpful</span>
                        </button>
                        <span className="text-gray-400">•</span>
                        <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reviews.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No reviews yet. Be the first to review this course!
              </p>
              {session && (
                <Button
                  className="mt-4"
                  onClick={() => setShowReviewForm(true)}
                >
                  Write the First Review
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

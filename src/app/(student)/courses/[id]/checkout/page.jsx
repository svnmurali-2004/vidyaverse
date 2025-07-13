"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Shield,
  Clock,
  BookOpen,
  Award,
  ArrowLeft,
  CheckCircle,
  Lock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { use } from "react";

export default function CheckoutPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, status, router]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data.data);
        setFinalPrice(data.data.price);

        // Check if already enrolled
        if (data.data.isEnrolled) {
          toast.error("You are already enrolled in this course");
          router.push(`/courses/${courseId}`);
          return;
        }

        // Redirect if course is free
        if (data.data.price === 0) {
          toast.error("This course is free. No payment required.");
          router.push(`/courses/${courseId}`);
          return;
        }
      } else {
        toast.error("Course not found");
        router.push("/courses");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, courseId }),
      });

      if (response.ok) {
        const data = await response.json();
        setDiscount(data.discount);
        setFinalPrice(course.price - data.discount);
        toast.success("Coupon applied successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Failed to apply coupon");
    }
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Create order using the existing payments API
      const orderResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          action: "create_order",
        }),
      });

      const responseText = await orderResponse.text();
      
      if (!orderResponse.ok) {
        console.error("Order creation failed:", {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          response: responseText
        });
        
        let errorMessage = "Failed to create order";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Response is not JSON, might be HTML error page
          if (responseText.includes("<!DOCTYPE") || responseText.includes("<html")) {
            errorMessage = "Server error occurred. Please try again.";
          } else {
            errorMessage = responseText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      let orderData;
      try {
        orderData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse order response:", responseText);
        throw new Error("Invalid response from server");
      }

      if (paymentMethod === "razorpay") {
        // Initialize Razorpay
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_6etUlx1588eZwL",
            amount: orderData.amount, // Already in paise from API
            currency: orderData.currency,
            name: "VidyaVerse",
            description: course.title,
            order_id: orderData.orderId,
            prefill: {
              name: session.user.name,
              email: session.user.email,
            },
            theme: {
              color: "#2563eb",
            },
            handler: async (response) => {
              try {
                // Verify payment using the existing payments API
                const verifyResponse = await fetch("/api/payments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "verify_payment",
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });

                const verifyText = await verifyResponse.text();
                
                if (verifyResponse.ok) {
                  let verifyData;
                  try {
                    verifyData = JSON.parse(verifyText);
                  } catch (e) {
                    console.error("Failed to parse verify response:", verifyText);
                  }
                  
                  toast.success("Payment successful! You are now enrolled.");
                  router.push(`/courses/${courseId}/success`);
                } else {
                  console.error("Payment verification failed:", {
                    status: verifyResponse.status,
                    response: verifyText
                  });
                  toast.error("Payment verification failed");
                }
              } catch (error) {
                console.error("Error during payment verification:", error);
                toast.error("Payment verification failed");
              }
            },
            modal: {
              ondismiss: () => {
                setProcessing(false);
              },
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        };
        document.head.appendChild(script);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Payment failed");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="outline" asChild>
          <Link href={`/courses/${courseId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <img
                  src={course.thumbnail || "/placeholder-course.jpg"}
                  alt={course.title}
                  className="w-24 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{course.title}</h3>
                  <p className="text-gray-600">by {course.instructor?.name}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {course.lessonCount || 0} lessons
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration || "Self-paced"}
                    </div>
                    <Badge variant="secondary">{course.level}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-radio"
                  />
                  <CreditCard className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">
                      Credit/Debit Card, UPI, Net Banking
                    </div>
                    <div className="text-sm text-gray-600">
                      Powered by Razorpay
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </CardContent>
          </Card>

          {/* Coupon Code */}
          <Card>
            <CardHeader>
              <CardTitle>Promo Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={!couponCode.trim()}
                >
                  Apply
                </Button>
              </div>
              {discount > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ Coupon applied! You saved ₹{discount}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Course Price</span>
                <span>₹{course.price}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{finalPrice}</span>
              </div>

              <Button
                onClick={handlePayment}
                className="w-full"
                size="lg"
                disabled={processing}
              >
                {processing ? (
                  "Processing..."
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Complete Payment
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-600 text-center">
                By completing your purchase, you agree to our Terms of Service
              </div>
            </CardContent>
          </Card>

          {/* Course Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Lifetime access</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Mobile and desktop access</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Certificate of completion</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Secure payment • SSL encrypted</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

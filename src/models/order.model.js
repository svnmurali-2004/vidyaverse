import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    amount: { type: Number, required: true }, // Final amount after discount
    originalAmount: { type: Number, required: true }, // Original course price
    discountAmount: { type: Number, default: 0 }, // Discount applied
    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "free"],
      default: "razorpay",
    },
    razorpayOrderId: String, // Razorpay order ID
    razorpayPaymentId: String, // Razorpay payment ID
    razorpaySignature: String, // Razorpay signature for verification
    couponCode: String, // Applied coupon code
    appliedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);

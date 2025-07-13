import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    amount: { type: Number, required: true },
    paymentMethod: { 
      type: String, 
      enum: ["razorpay", "stripe", "free"], 
      default: "razorpay" 
    },
    razorpayOrderId: String, // Razorpay order ID
    razorpayPaymentId: String, // Razorpay payment ID
    razorpaySignature: String, // Razorpay signature for verification
    couponCode: String,
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);

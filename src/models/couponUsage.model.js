import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema({
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  originalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  usedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for performance
couponUsageSchema.index({ coupon: 1, user: 1 });
couponUsageSchema.index({ coupon: 1 });
couponUsageSchema.index({ user: 1 });
couponUsageSchema.index({ usedAt: 1 });

const CouponUsage = mongoose.models.CouponUsage || mongoose.model("CouponUsage", couponUsageSchema);
export default CouponUsage;
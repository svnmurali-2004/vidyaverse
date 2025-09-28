import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  description: {
    type: String,
    required: true,
    maxlength: 200,
  },
  type: {
    type: String,
    required: true,
    enum: ["percentage", "fixed"],
    default: "percentage",
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  maxDiscount: {
    type: Number,
    min: 0,
    // Only applicable for percentage coupons
  },
  minOrderValue: {
    type: Number,
    min: 0,
    default: 0,
  },
  applicableTo: {
    type: String,
    enum: ["all", "specific_courses", "specific_categories"],
    default: "all",
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  }],
  categories: [{
    type: String,
  }],
  usageLimit: {
    type: Number,
    min: 1,
    default: null, // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  userLimit: {
    type: Number,
    min: 1,
    default: 1, // How many times a single user can use this coupon
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

// Virtual to check if coupon is expired
couponSchema.virtual("isExpired").get(function() {
  return new Date() > this.validUntil;
});

// Virtual to check if coupon is currently valid (active and not expired)
couponSchema.virtual("isCurrentlyValid").get(function() {
  const now = new Date();
  return this.isActive && now >= this.validFrom && now <= this.validUntil;
});

// Method to check if coupon can be used by a specific user
couponSchema.methods.canBeUsedBy = async function(userId) {
  if (!this.isCurrentlyValid) return false;
  
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  
  // Check user-specific usage limit
  if (this.userLimit > 0) {
    const CouponUsage = mongoose.model("CouponUsage");
    const userUsageCount = await CouponUsage.countDocuments({
      coupon: this._id,
      user: userId,
    });
    
    if (userUsageCount >= this.userLimit) return false;
  }
  
  return true;
};

// Method to calculate discount for a given amount and course
couponSchema.methods.calculateDiscount = function(orderAmount, courseId = null, courseCategory = null) {
  // Check applicability
  if (this.applicableTo === "specific_courses" && courseId) {
    if (!this.courses.some(c => c.toString() === courseId.toString())) {
      return { valid: false, reason: "Coupon not applicable to this course" };
    }
  } else if (this.applicableTo === "specific_categories" && courseCategory) {
    if (!this.categories.includes(courseCategory)) {
      return { valid: false, reason: "Coupon not applicable to this course category" };
    }
  }
  
  // Check minimum order value
  if (orderAmount < this.minOrderValue) {
    return { 
      valid: false, 
      reason: `Minimum order value of ₹${this.minOrderValue} required` 
    };
  }
  
  let discount = 0;
  
  if (this.type === "percentage") {
    discount = Math.round((orderAmount * this.value) / 100);
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else if (this.type === "fixed") {
    discount = Math.min(this.value, orderAmount);
  }
  
  return {
    valid: true,
    discount,
    finalAmount: Math.max(0, orderAmount - discount),
  };
};

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
export default Coupon;
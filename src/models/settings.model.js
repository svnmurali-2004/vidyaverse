import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'VidyaVerse'
  },
  siteDescription: {
    type: String,
    default: 'Learn, Grow, and Excel with VidyaVerse'
  },
  supportEmail: {
    type: String,
    default: 'support@vidyaverse.com'
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  requireEmailVerification: {
    type: Boolean,
    default: true
  },
  enableCourseReviews: {
    type: Boolean,
    default: true
  },
  maxFileUploadSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
export default Settings;

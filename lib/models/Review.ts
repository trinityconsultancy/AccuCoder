import mongoose, { Schema, Model } from 'mongoose'

export interface IReview {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  role: string
  location: string
  country: string
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  moderatedBy?: string
  moderatedAt?: Date
  moderatorNotes?: string
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    moderatedBy: {
      type: String,
      required: false,
    },
    moderatedAt: {
      type: Date,
      required: false,
    },
    moderatorNotes: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes
ReviewSchema.index({ status: 1 })
ReviewSchema.index({ createdAt: -1 })

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)

export default Review

import mongoose, { Schema, Model } from 'mongoose'

export interface IProfile {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  firstName: string
  lastName: string
  certificationBody: 'AAPC' | 'AHIMA'
  certificationTitle: string
  aapcId?: string
  ahimaId?: string
  organization?: string
  position?: string
  createdAt: Date
  updatedAt: Date
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    certificationBody: {
      type: String,
      required: [true, 'Certification body is required'],
      enum: ['AAPC', 'AHIMA'],
    },
    certificationTitle: {
      type: String,
      required: [true, 'Certification title is required'],
      trim: true,
    },
    aapcId: {
      type: String,
      trim: true,
    },
    ahimaId: {
      type: String,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Create index for userId lookups
ProfileSchema.index({ userId: 1 })

const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema)

export default Profile

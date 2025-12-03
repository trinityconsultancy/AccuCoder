import mongoose, { Schema, Model } from 'mongoose'

export interface ISession {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  token: string
  expiresAt: Date
  rememberMe: boolean
  createdAt: Date
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes for efficient lookups
SessionSchema.index({ userId: 1 })

// Auto-delete expired sessions (TTL index)
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)

export default Session

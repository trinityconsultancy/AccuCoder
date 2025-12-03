import mongoose, { Schema, Model } from 'mongoose'

export interface IAlphabeticalIndex {
  _id: mongoose.Types.ObjectId
  term: string
  code?: string
  reference?: string
  seeAlso?: string
  type: string
  indentLevel: number
  createdAt: Date
  updatedAt: Date
}

const AlphabeticalIndexSchema = new Schema<IAlphabeticalIndex>(
  {
    term: {
      type: String,
      required: [true, 'Term is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    seeAlso: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      trim: true,
    },
    indentLevel: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes for search
AlphabeticalIndexSchema.index({ term: 1 })
AlphabeticalIndexSchema.index({ term: 'text' })
AlphabeticalIndexSchema.index({ type: 1 })

const AlphabeticalIndex: Model<IAlphabeticalIndex> = 
  mongoose.models.AlphabeticalIndex || mongoose.model<IAlphabeticalIndex>('AlphabeticalIndex', AlphabeticalIndexSchema)

export default AlphabeticalIndex

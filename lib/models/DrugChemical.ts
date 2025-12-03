import mongoose, { Schema, Model } from 'mongoose'

export interface IDrugChemical {
  _id: mongoose.Types.ObjectId
  substance: string
  poisoningAccidentalUnintentional?: string
  poisoningIntentionalSelfHarm?: string
  poisoningAssault?: string
  poisoningUndetermined?: string
  adverseEffect?: string
  underdosing?: string
  createdAt: Date
  updatedAt: Date
}

const DrugChemicalSchema = new Schema<IDrugChemical>(
  {
    substance: {
      type: String,
      required: [true, 'Substance name is required'],
      trim: true,
    },
    poisoningAccidentalUnintentional: {
      type: String,
      trim: true,
    },
    poisoningIntentionalSelfHarm: {
      type: String,
      trim: true,
    },
    poisoningAssault: {
      type: String,
      trim: true,
    },
    poisoningUndetermined: {
      type: String,
      trim: true,
    },
    adverseEffect: {
      type: String,
      trim: true,
    },
    underdosing: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Create index for substance searches
DrugChemicalSchema.index({ substance: 1 })
DrugChemicalSchema.index({ substance: 'text' })

const DrugChemical: Model<IDrugChemical> = 
  mongoose.models.DrugChemical || mongoose.model<IDrugChemical>('DrugChemical', DrugChemicalSchema)

export default DrugChemical

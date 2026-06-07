import mongoose, { Document, Schema } from 'mongoose';

export interface IDrinkTemplate extends Document {
  userId: mongoose.Types.ObjectId | null;
  name: string;
  amountMl: number;
  drinkType: string;
  emoji: string;
  color: string;
  waterFactor: number;
  isSystem: boolean;
}

const DrinkTemplateSchema = new Schema<IDrinkTemplate>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
  name:        { type: String, required: true, maxlength: 64 },
  amountMl:    { type: Number, required: true, min: 1 },
  drinkType:   { type: String, required: true },
  emoji:       { type: String, default: '💧' },
  color:       { type: String, default: '#3b82f6' },
  waterFactor: { type: Number, default: 1.0, min: -1, max: 1 },
  isSystem:    { type: Boolean, default: false },
}, { timestamps: true });

DrinkTemplateSchema.index({ userId: 1 });
DrinkTemplateSchema.index({ isSystem: 1 });

export const DrinkTemplate = mongoose.model<IDrinkTemplate>('DrinkTemplate', DrinkTemplateSchema);
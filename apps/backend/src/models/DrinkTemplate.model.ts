import mongoose, { Document, Schema } from 'mongoose';
export interface IDrinkTemplate extends Document {
  userId: mongoose.Types.ObjectId | null; name: string; amountMl: number;
  drinkType: string; icon: string; color: string; isSystem: boolean;
}
const DrinkTemplateSchema = new Schema<IDrinkTemplate>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true, maxlength: 64 },
  amountMl: { type: Number, required: true, min: 1 },
  drinkType: { type: String, required: true },
  icon: { type: String, default: 'droplets' }, color: { type: String, default: '#3b82f6' },
  isSystem: { type: Boolean, default: false },
}, { timestamps: true });
DrinkTemplateSchema.index({ userId: 1 }); DrinkTemplateSchema.index({ isSystem: 1 });
export const DrinkTemplate = mongoose.model<IDrinkTemplate>('DrinkTemplate', DrinkTemplateSchema);

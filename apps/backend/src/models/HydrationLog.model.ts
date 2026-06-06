import mongoose, { Document, Schema } from 'mongoose';
export interface IHydrationLog extends Document {
  userId: mongoose.Types.ObjectId; amountMl: number; drinkType: string;
  templateId: mongoose.Types.ObjectId | null; note: string; loggedAt: Date; date: Date;
}
const HydrationLogSchema = new Schema<IHydrationLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amountMl: { type: Number, required: true, min: 1 },
  drinkType: { type: String, default: 'water' },
  templateId: { type: Schema.Types.ObjectId, ref: 'DrinkTemplate', default: null },
  note: { type: String, default: '' },
  loggedAt: { type: Date, required: true }, date: { type: Date, required: true },
}, { timestamps: true });
HydrationLogSchema.index({ userId: 1, date: -1 });
export const HydrationLog = mongoose.model<IHydrationLog>('HydrationLog', HydrationLogSchema);

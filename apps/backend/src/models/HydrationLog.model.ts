import mongoose, { Document, Schema } from 'mongoose';

export interface IHydrationLog extends Document {
  userId: mongoose.Types.ObjectId;
  amountMl: number;
  effectiveMl: number;
  drinkType: string;
  waterFactor: number;
  templateId: mongoose.Types.ObjectId | null;
  note: string;
  loggedAt: Date;
  date: Date;
}

const HydrationLogSchema = new Schema<IHydrationLog>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amountMl:    { type: Number, required: true, min: 1 },
  effectiveMl: { type: Number, required: true, min: 0 },
  drinkType:   { type: String, default: 'water' },
  waterFactor: { type: Number, default: 1.0 },
  templateId:  { type: Schema.Types.ObjectId, ref: 'DrinkTemplate', default: null },
  note:        { type: String, default: '' },
  loggedAt:    { type: Date, required: true },
  date:        { type: Date, required: true },
}, { timestamps: true });

HydrationLogSchema.index({ userId: 1, date: -1 });

export const HydrationLog = mongoose.model<IHydrationLog>('HydrationLog', HydrationLogSchema);
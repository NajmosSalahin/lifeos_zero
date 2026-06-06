import mongoose, { Document, Schema } from 'mongoose';
export interface ISleepLog extends Document {
  userId: mongoose.Types.ObjectId; bedtime: Date; wakeTime: Date;
  quality: number; note: string; tags: string[]; date: Date;
  createdAt: Date; updatedAt: Date;
}
const SleepLogSchema = new Schema<ISleepLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bedtime: { type: Date, required: true }, wakeTime: { type: Date, required: true },
  quality: { type: Number, required: true, min: 1, max: 5 },
  note: { type: String, default: '' }, tags: { type: [String], default: [] },
  date: { type: Date, required: true },
}, { timestamps: true });
SleepLogSchema.index({ userId: 1, date: -1 });
export const SleepLog = mongoose.model<ISleepLog>('SleepLog', SleepLogSchema);

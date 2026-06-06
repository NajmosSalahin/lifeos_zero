import mongoose, { Document, Schema } from 'mongoose';
export interface IMoodLog extends Document {
  userId: mongoose.Types.ObjectId; score: number; note: string;
  tags: string[]; loggedAt: Date; createdAt: Date; updatedAt: Date;
}
const MoodLogSchema = new Schema<IMoodLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 1, max: 10 },
  note: { type: String, default: '', maxlength: 2048 },
  tags: { type: [String], default: [] },
  loggedAt: { type: Date, required: true },
}, { timestamps: true });
MoodLogSchema.index({ userId: 1, loggedAt: -1 });
export const MoodLog = mongoose.model<IMoodLog>('MoodLog', MoodLogSchema);

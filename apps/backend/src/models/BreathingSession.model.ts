import mongoose, { Document, Schema } from 'mongoose';
export interface IBreathingSession extends Document {
  userId: mongoose.Types.ObjectId; techniqueId: mongoose.Types.ObjectId;
  techniqueName: string; durationSeconds: number; cyclesCompleted: number;
  completedAt: Date; rating: number | null; note: string; date: Date;
}
const BreathingSessionSchema = new Schema<IBreathingSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  techniqueId: { type: Schema.Types.ObjectId, ref: 'BreathingTechnique', required: true },
  techniqueName: { type: String, required: true },
  durationSeconds: { type: Number, required: true },
  cyclesCompleted: { type: Number, required: true },
  completedAt: { type: Date, required: true },
  rating: { type: Number, min: 1, max: 5, default: null },
  note: { type: String, default: '' }, date: { type: Date, required: true },
}, { timestamps: true });
BreathingSessionSchema.index({ userId: 1, date: -1 });
export const BreathingSession = mongoose.model<IBreathingSession>('BreathingSession', BreathingSessionSchema);

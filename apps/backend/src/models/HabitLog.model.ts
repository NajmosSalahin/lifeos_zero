import mongoose, { Document, Schema } from 'mongoose';
export interface IHabitLog extends Document {
  userId: mongoose.Types.ObjectId; habitId: mongoose.Types.ObjectId;
  date: Date; count: number; completed: boolean; note: string;
}
const HabitLogSchema = new Schema<IHabitLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: Date, required: true },
  count: { type: Number, default: 1, min: 0 },
  completed: { type: Boolean, default: false },
  note: { type: String, default: '', maxlength: 1024 },
}, { timestamps: true });
HabitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });
HabitLogSchema.index({ userId: 1, date: 1 });
export const HabitLog = mongoose.model<IHabitLog>('HabitLog', HabitLogSchema);

import mongoose, { Document, Schema } from 'mongoose';
export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId; name: string; description?: string;
  category: string; color: string; icon: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  targetDays: number[]; targetCount: number; unit: string;
  reminderTime: string | null; reminderEnabled: boolean;
  isArchived: boolean; archivedAt: Date | null; order: number;
  createdAt: Date; updatedAt: Date;
}
const HabitSchema = new Schema<IHabit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 128 },
  description: { type: String, trim: true, maxlength: 512 },
  category: { type: String, default: 'other' },
  color: { type: String, default: '#6366f1' }, icon: { type: String, default: 'check' },
  frequency: { type: String, enum: ['daily','weekly','monthly','custom'], default: 'daily' },
  targetDays: { type: [Number], default: [] },
  targetCount: { type: Number, default: 1, min: 1 },
  unit: { type: String, default: 'times' },
  reminderTime: { type: String, default: null }, reminderEnabled: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false }, archivedAt: { type: Date, default: null },
  order: { type: Number, default: 0 },
}, { timestamps: true });
HabitSchema.index({ userId: 1, isArchived: 1 });
HabitSchema.index({ userId: 1, category: 1 });
export const Habit = mongoose.model<IHabit>('Habit', HabitSchema);

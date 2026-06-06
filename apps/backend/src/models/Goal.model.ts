import mongoose, { Document, Schema } from 'mongoose';
export interface IMilestone { _id: mongoose.Types.ObjectId; title: string; description: string; dueDate: Date | null; completedAt: Date | null; isCompleted: boolean; order: number; }
export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId; title: string; description: string;
  category: string; status: 'active'|'completed'|'paused'|'abandoned';
  priority: 'low'|'medium'|'high'; startDate: Date; targetDate: Date | null;
  completedAt: Date | null; currentValue: number; targetValue: number; unit: string;
  milestones: IMilestone[]; color: string; icon: string; isArchived: boolean;
  createdAt: Date; updatedAt: Date;
}
const MilestoneSchema = new Schema<IMilestone>({
  title: { type: String, required: true, maxlength: 256 },
  description: { type: String, default: '' },
  dueDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  isCompleted: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});
const GoalSchema = new Schema<IGoal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 256 },
  description: { type: String, default: '' },
  category: { type: String, default: 'personal' },
  status: { type: String, enum: ['active','completed','paused','abandoned'], default: 'active' },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  startDate: { type: Date, required: true },
  targetDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  currentValue: { type: Number, default: 0 },
  targetValue: { type: Number, default: 100 },
  unit: { type: String, default: '%' },
  milestones: { type: [MilestoneSchema], default: [] },
  color: { type: String, default: '#22c55e' },
  icon: { type: String, default: 'target' },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });
GoalSchema.index({ userId: 1, status: 1 });
export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);

import mongoose, { Document, Schema } from 'mongoose';
export interface IBreathingPhase { name: string; durationSeconds: number; instruction: string; }
export interface IBreathingTechnique extends Document {
  userId: mongoose.Types.ObjectId | null; name: string; description: string;
  phases: IBreathingPhase[]; totalCycleDuration: number; recommendedCycles: number;
  category: string; isSystem: boolean; tags: string[];
}
const PhaseSchema = new Schema<IBreathingPhase>({
  name: { type: String, required: true }, durationSeconds: { type: Number, required: true },
  instruction: { type: String, default: '' },
}, { _id: false });
const BreathingTechniqueSchema = new Schema<IBreathingTechnique>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true, maxlength: 64 },
  description: { type: String, default: '' },
  phases: { type: [PhaseSchema], required: true },
  totalCycleDuration: { type: Number, required: true },
  recommendedCycles: { type: Number, default: 5 },
  category: { type: String, default: 'relaxation' },
  isSystem: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
}, { timestamps: true });
BreathingTechniqueSchema.index({ isSystem: 1 }); BreathingTechniqueSchema.index({ userId: 1 });
export const BreathingTechnique = mongoose.model<IBreathingTechnique>('BreathingTechnique', BreathingTechniqueSchema);

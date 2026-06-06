import mongoose, { Document, Schema } from 'mongoose';
export interface IJournalEntry extends Document {
  userId: mongoose.Types.ObjectId; title: string; content: string;
  contentText: string; tags: string[]; category: string;
  isFavorite: boolean; wordCount: number; readingTimeMinutes: number;
  mood: number | null; date: Date; createdAt: Date; updatedAt: Date;
}
const JournalEntrySchema = new Schema<IJournalEntry>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 256 },
  content: { type: String, required: true },
  contentText: { type: String, default: '' },
  tags: { type: [String], default: [] },
  category: { type: String, default: 'general' },
  isFavorite: { type: Boolean, default: false },
  wordCount: { type: Number, default: 0 },
  readingTimeMinutes: { type: Number, default: 0 },
  mood: { type: Number, min: 1, max: 10, default: null },
  date: { type: Date, required: true },
}, { timestamps: true });
JournalEntrySchema.index({ userId: 1, date: -1 });
JournalEntrySchema.index({ userId: 1, isFavorite: 1 });
JournalEntrySchema.index({ userId: 1, tags: 1 });
JournalEntrySchema.index({ title: 'text', contentText: 'text' });
export const JournalEntry = mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);

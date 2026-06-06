import mongoose, { Document, Schema } from 'mongoose';
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; type: string; title: string; body: string;
  isRead: boolean; readAt: Date | null; actionUrl: string | null;
  metadata: Record<string, unknown>; createdAt: Date;
}
const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true, maxlength: 128 },
  body: { type: String, required: true, maxlength: 512 },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  actionUrl: { type: String, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

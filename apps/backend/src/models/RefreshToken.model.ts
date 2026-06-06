import mongoose, { Document, Schema } from 'mongoose';
export interface IRefreshToken extends Document {
  token: string; userId: mongoose.Types.ObjectId; userAgent: string; ipAddress: string;
  expiresAt: Date; revokedAt: Date | null; replacedByToken: string | null; isActive: boolean;
}
const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userAgent: { type: String, default: '' }, ipAddress: { type: String, default: '' },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null }, replacedByToken: { type: String, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);

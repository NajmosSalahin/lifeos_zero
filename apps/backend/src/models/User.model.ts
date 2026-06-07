import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';

export interface IDashboardWidget {
  id: string; type: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  visible: boolean; pinned: boolean;
}

export interface IUserPreferences {
  theme: string; font: string; fontSize: string; density: string;
  accentColor: string; sidebarCollapsed: boolean; sidebarWidth: number;
  reducedMotion: boolean; highContrast: boolean; readabilityMode: boolean;
  dashboardLayout: IDashboardWidget[];
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string; passwordHash: string; firstName: string; lastName: string;
  role: 'user' | 'admin'; isEmailVerified: boolean;
  emailVerificationToken: string | null; emailVerificationExpires: Date | null;
  passwordResetToken: string | null; passwordResetExpires: Date | null;
  lastLoginAt: Date | null; loginCount: number;
  preferences: IUserPreferences;
  hydrationGoal: number; sleepGoal: number; timezone: string;
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  createdAt: Date; updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const WidgetSchema = new Schema<IDashboardWidget>({
  id: { type: String, required: true }, type: { type: String, required: true },
  position: { x: { type: Number, default: 0 }, y: { type: Number, default: 0 } },
  size: { w: { type: Number, default: 2 }, h: { type: Number, default: 2 } },
  visible: { type: Boolean, default: true }, pinned: { type: Boolean, default: false },
}, { _id: false });

const UserSchema = new Schema<IUser>({
  email:                    { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:             { type: String, required: true, select: false },
  firstName:                { type: String, required: true, trim: true, maxlength: 64 },
  lastName:                 { type: String, required: true, trim: true, maxlength: 64 },
  role:                     { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified:          { type: Boolean, default: false },
  emailVerificationToken:   { type: String, default: null, select: false },
  emailVerificationExpires: { type: Date, default: null, select: false },
  passwordResetToken:       { type: String, default: null, select: false },
  passwordResetExpires:     { type: Date, default: null, select: false },
  lastLoginAt:              { type: Date, default: null },
  loginCount:               { type: Number, default: 0 },
  hydrationGoal:            { type: Number, default: 2500 },
  sleepGoal:                { type: Number, default: 480 },
  timezone:                 { type: String, default: 'UTC' },
  weight:                   { type: Number, default: 70 },
  height:                   { type: Number, default: 170 },
  activityLevel:            { type: String, enum: ['sedentary','light','moderate','active','very_active'], default: 'moderate' },
  preferences: {
    theme:            { type: String, default: 'dark' },
    font:             { type: String, default: 'inter' },
    fontSize:         { type: String, default: 'md' },
    density:          { type: String, default: 'comfortable' },
    accentColor:      { type: String, default: '#6366f1' },
    sidebarCollapsed: { type: Boolean, default: false },
    sidebarWidth:     { type: Number, default: 240 },
    reducedMotion:    { type: Boolean, default: false },
    highContrast:     { type: Boolean, default: false },
    readabilityMode:  { type: Boolean, default: false },
    dashboardLayout:  { type: [WidgetSchema], default: [] },
  },
}, { timestamps: true });

UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });
UserSchema.index({ passwordResetToken: 1 }, { sparse: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, config.BCRYPT_ROUNDS);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
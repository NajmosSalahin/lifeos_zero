import { z } from 'zod';
const pw = z.string().min(8).max(128).regex(/[A-Z]/, 'Needs uppercase').regex(/[a-z]/, 'Needs lowercase').regex(/[0-9]/, 'Needs number');
export const RegisterSchema = z.object({ email: z.string().email().max(255), password: pw, firstName: z.string().min(1).max(64).trim(), lastName: z.string().min(1).max(64).trim() });
export const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1), rememberMe: z.boolean().optional().default(false) });
export const ForgotPasswordSchema = z.object({ email: z.string().email() });
export const ResetPasswordSchema = z.object({ token: z.string().min(1), password: pw });
export const ChangePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: pw });
export const VerifyEmailSchema = z.object({ token: z.string().min(1) });

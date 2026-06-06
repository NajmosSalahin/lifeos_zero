import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/lifeos_dev'),
  JWT_ACCESS_SECRET: z.string().min(10).default('dev_access_secret_please_change_in_production'),
  JWT_REFRESH_SECRET: z.string().min(10).default('dev_refresh_secret_please_change_in_production'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(10).default('dev_cookie_secret_please_change_in_production'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  REMEMBER_ME_EXPIRES_DAYS: z.coerce.number().default(30),
  SESSION_EXPIRES_DAYS: z.coerce.number().default(7),
  EMAIL_FROM: z.string().default('noreply@lifeos.app'),
  EMAIL_FROM_NAME: z.string().default('LifeOS'),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const config = parsed.data;

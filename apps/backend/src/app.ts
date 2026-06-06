import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { config } from './config';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { registerRoutes } from './routes';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(cors({
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }));

  app.options('*', cors({
    origin: config.CLIENT_URL,
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(config.COOKIE_SECRET));
  app.use(mongoSanitize());
  app.use(globalRateLimiter);

  app.get('/health', (_req, res) => res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  }));

  registerRoutes(app);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
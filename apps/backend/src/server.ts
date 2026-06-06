import 'dotenv/config';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { config } from './config';
import { logger } from './config/logger';
import { seedSystemData } from './shared/utils/seed';

const bootstrap = async () => {
  try {
    await connectDatabase(config.MONGODB_URI);
    logger.info('✅ MongoDB connected');

    await seedSystemData();
    logger.info('✅ System data seeded');

    const app = createApp();
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 LifeOS API running on port ${config.PORT} [${config.NODE_ENV}]`);
    });

    const shutdown = (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => { logger.info('Server closed'); process.exit(0); });
      setTimeout(() => process.exit(1), 10000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
    process.on('unhandledRejection', (err) => { logger.error('Unhandled rejection:', err); process.exit(1); });

  } catch (err) {
    logger.error('Bootstrap failed:', err);
    process.exit(1);
  }
};

bootstrap();

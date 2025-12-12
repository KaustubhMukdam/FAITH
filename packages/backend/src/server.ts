import app from './app';
import pool from './config/database';
import redis from './config/redis';
import logger from './config/logger';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    logger.info('âœ… Database connection successful');

    // Test Redis connection
    await redis.ping();
    logger.info('âœ… Redis connection successful');

    // Start server
    app.listen(PORT, () => {
      logger.info(`íº€ FAITH Backend running on http://${HOST}:${PORT}`);
      logger.info(`í³Š Environment: ${process.env.NODE_ENV}`);
      logger.info(`í¿¥ Health check: http://${HOST}:${PORT}/health`);
    });
  } catch (error) {
    logger.error('âŒ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await pool.end();
  await redis.quit();
  process.exit(0);
});

startServer();

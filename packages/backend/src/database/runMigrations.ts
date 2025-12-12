import fs from 'fs';
import path from 'path';
import pool from '../config/database';
import logger from '../config/logger';

async function runMigrations() {
  try {
    logger.info('Ì¥Ñ Starting database migrations...');

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      logger.info(`Running migration: ${file}`);
      await pool.query(sql);
      logger.info(`‚úÖ Completed: ${file}`);
    }

    logger.info('‚úÖ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('‚ùå Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

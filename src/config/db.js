const { Pool } = require('pg');
const logger = require('../logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'voqstra',
  user: process.env.DB_USER || 'voqstra',
  password: process.env.DB_PASSWORD || 'voqstra123',
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL client error', { error: err.message });
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    logger.info('Running DB migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS calls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        audio_filename VARCHAR(255),
        duration_seconds INT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS call_insights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
        transcript TEXT,
        sentiment VARCHAR(20),
        summary TEXT,
        action_items JSONB,
        needs_followup BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
        recipient_email VARCHAR(255),
        channel VARCHAR(20) DEFAULT 'email',
        message_body TEXT,
        preview_url TEXT,
        sent_at TIMESTAMPTZ DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'sent'
      );
    `);

    logger.info('DB migrations completed successfully');
  } catch (err) {
    logger.error('Migration failed', { error: err.message });
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, runMigrations };

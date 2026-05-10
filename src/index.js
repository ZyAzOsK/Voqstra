require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { runMigrations } = require('./config/db');
const callsRouter = require('./routes/calls');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static dashboard
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/calls', callsRouter);

// Root health ping
app.get('/api/ping', (req, res) => res.json({ status: 'ok', service: 'voqstra', version: '1.0.0' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

async function start() {
  try {
    await runMigrations();
    app.listen(PORT, () => {
      logger.info(`Voqstra API running on http://localhost:${PORT}`);
      logger.info(`Dashboard: http://localhost:${PORT}`);
      logger.info(`Health:    http://localhost:${PORT}/api/calls/health`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

start();

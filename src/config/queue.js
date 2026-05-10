const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const logger = require('../logger');

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

connection.on('connect', () => logger.info('Redis connected'));
connection.on('error', (err) => logger.error('Redis error', { error: err.message }));

const callQueue = new Queue('call-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 15000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

module.exports = { callQueue, connection };

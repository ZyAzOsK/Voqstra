require('dotenv').config();
const { Worker } = require('bullmq');
const { connection } = require('../config/queue');
const { pool } = require('../config/db');
const { analyzeCall } = require('../services/geminiService');
const { sendFollowUp } = require('../services/notifyService');
const logger = require('../logger');

const worker = new Worker(
  'call-processing',
  async (job) => {
    const { callId, audioPath, customerName, customerEmail } = job.data;
    logger.info(`[Worker] Processing job ${job.id}`, { callId, audioPath });

    // Step 1: Update status to processing
    await pool.query(`UPDATE calls SET status = 'processing' WHERE id = $1`, [callId]);

    // Step 2: Analyze call with Gemini (transcription + insights in one shot)
    let analysis;
    try {
      analysis = await analyzeCall(audioPath);
    } catch (err) {
      logger.error('[Worker] Gemini analysis failed', { callId, error: err.message });
      await pool.query(`UPDATE calls SET status = 'failed' WHERE id = $1`, [callId]);
      throw err; // BullMQ will retry
    }

    const { transcript, sentiment, summary, action_items, needs_followup } = analysis;

    // Step 3: Save insights to DB
    const insightResult = await pool.query(
      `INSERT INTO call_insights (call_id, transcript, sentiment, summary, action_items, needs_followup)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [callId, transcript, sentiment, summary, JSON.stringify(action_items), needs_followup]
    );
    logger.info('[Worker] Insights saved', { insightId: insightResult.rows[0].id });

    // Step 4: Send follow-up if needed
    if (needs_followup && customerEmail) {
      try {
        const { messageBody, previewUrl } = await sendFollowUp({
          customerName,
          customerEmail,
          summary,
          actionItems: action_items,
        });

        await pool.query(
          `INSERT INTO messages (call_id, recipient_email, channel, message_body, preview_url)
           VALUES ($1, $2, 'email', $3, $4)`,
          [callId, customerEmail, messageBody, previewUrl]
        );

        logger.info('[Worker] Follow-up message logged', { callId, previewUrl });
      } catch (err) {
        // Non-fatal: log but don't fail the job
        logger.error('[Worker] Follow-up send failed (non-fatal)', { error: err.message });
      }
    } else {
      logger.info('[Worker] No follow-up required', { callId, needs_followup });
    }

    // Step 5: Mark call as done
    await pool.query(`UPDATE calls SET status = 'done' WHERE id = $1`, [callId]);
    logger.info(`[Worker] Job ${job.id} completed successfully`, { callId });

    return { callId, sentiment, needs_followup };
  },
  {
    connection,
    concurrency: 2,
  }
);

worker.on('completed', (job, result) => {
  logger.info(`[Worker] Job ${job.id} finished`, result);
});

worker.on('failed', (job, err) => {
  logger.error(`[Worker] Job ${job?.id} failed`, { error: err.message, attempts: job?.attemptsMade });
});

worker.on('error', (err) => {
  logger.error('[Worker] Worker error', { error: err.message });
});

logger.info('Voqstra call worker started — waiting for jobs...');

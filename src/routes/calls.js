const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const { callQueue } = require('../config/queue');
const logger = require('../logger');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '25') * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.mp4', '.wav', '.webm', '.m4a', '.ogg', '.flac'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type. Allowed: ${allowed.join(', ')}`));
    }
  },
});

// POST /api/calls/upload
router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided. Use field name "audio".' });
    }

    const { customer_name, customer_email, customer_phone } = req.body;

    if (!customer_name || !customer_email) {
      return res.status(400).json({ error: 'customer_name and customer_email are required.' });
    }

    // Insert call record
    const result = await pool.query(
      `INSERT INTO calls (customer_name, customer_email, customer_phone, audio_filename, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [customer_name, customer_email, customer_phone || null, req.file.filename]
    );
    const call = result.rows[0];

    // Enqueue background job
    const job = await callQueue.add('analyze-call', {
      callId: call.id,
      audioPath: path.resolve(req.file.path),
      customerName: customer_name,
      customerEmail: customer_email,
    });

    logger.info('Call uploaded and queued', { callId: call.id, jobId: job.id, file: req.file.filename });

    res.status(202).json({
      message: 'Call uploaded successfully. Processing started.',
      call_id: call.id,
      job_id: job.id,
      status: 'pending',
      check_status: `/api/calls/${call.id}`,
    });
  } catch (err) {
    logger.error('Upload error', { error: err.message });
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// GET /api/calls — list all calls
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, 
        ci.sentiment, ci.summary, ci.needs_followup,
        (SELECT COUNT(*) FROM messages m WHERE m.call_id = c.id) AS followup_count
       FROM calls c
       LEFT JOIN call_insights ci ON ci.call_id = c.id
       ORDER BY c.created_at DESC
       LIMIT 50`
    );
    res.json({ calls: rows, count: rows.length });
  } catch (err) {
    logger.error('List calls error', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

// GET /api/calls/health — MUST be before /:id to avoid "health" being treated as a UUID
router.get('/health', async (req, res) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      callQueue.getWaitingCount(),
      callQueue.getActiveCount(),
      callQueue.getCompletedCount(),
      callQueue.getFailedCount(),
    ]);

    const lastCall = await pool.query(
      `SELECT id, customer_name, status, created_at FROM calls ORDER BY created_at DESC LIMIT 1`
    );

    res.json({
      status: 'ok',
      queue: { waiting, active, completed, failed },
      last_call: lastCall.rows[0] || null,
      uptime_seconds: Math.floor(process.uptime()),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET /api/calls/:id — get single call with full insights
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const callResult = await pool.query(`SELECT * FROM calls WHERE id = $1`, [id]);
    if (callResult.rows.length === 0) {
      return res.status(404).json({ error: 'Call not found' });
    }

    const insightResult = await pool.query(`SELECT * FROM call_insights WHERE call_id = $1`, [id]);
    const messageResult = await pool.query(`SELECT * FROM messages WHERE call_id = $1 ORDER BY sent_at DESC`, [id]);

    res.json({
      call: callResult.rows[0],
      insights: insightResult.rows[0] || null,
      messages: messageResult.rows,
    });
  } catch (err) {
    logger.error('Get call error', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch call details' });
  }
});

module.exports = router;

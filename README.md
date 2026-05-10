# Voqstra — Smart Call Analytics & Auto-Follow-Up System

> Upload a call recording, transcribe & analyze it with AI, and automatically send a follow-up email based on extracted action items.

[![Node.js](https://img.shields.io/badge/Node.js-25.x-339933?logo=node.js)](https://nodejs.org)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?logo=google)](https://aistudio.google.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io)
[![BullMQ](https://img.shields.io/badge/BullMQ-5-FF6B35)](https://bullmq.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)

---

## What It Does

1. **Upload** a call audio file (MP3, WAV, M4A, etc.) via REST API
2. **Queue** the job with BullMQ + Redis for async processing
3. **Analyze** with Gemini 2.5 Flash (multimodal inference — one call does transcription + AI analysis)
4. **Store** transcript, sentiment, summary, and action items in PostgreSQL
5. **Auto-send** a follow-up email (via Ethereal test SMTP) if the AI identifies that the call requires a follow-up

---

## Demo Gallery

### 1. Uploading a Call via API
![API Upload](demoPics/api-upload.png)

### 2. Main Dashboard (Digital Art UI)
![Main Dashboard](demoPics/dashboard-main.png)

### 3. AI Insights & Transcript (Side Panel)
![Side Panel Top](demoPics/dashboard-modal-1.png)

### 4. Automated Follow-up Dispatch
![Side Panel Bottom](demoPics/dashboard-modal-2.png)
![Ethereal Email Preview](demoPics/dashboard-email.png)

---

## Architecture

```text
[Audio Upload]
      |
      v
[Express API] --> [PostgreSQL: calls table]
      |
      v
[Redis Queue] --> [BullMQ Worker]
                       |
                       +-- Gemini 2.5 Flash (audio -> transcript + insights)
                       +-- PostgreSQL: call_insights table
                       +-- Nodemailer Ethereal -> messages table
```

---

## Tech Stack

| Component | Technology |
|---|---|
| **Backend API** | Node.js + Express |
| **AI Analysis** | Google Gemini 2.5 Flash API (free tier) |
| **Database** | PostgreSQL 16 |
| **Job Queue** | BullMQ + Redis 7 |
| **Email Service** | Nodemailer + Ethereal Email |
| **Logging** | Winston |
| **Containers** | Docker Compose |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- [Google Gemini API key](https://aistudio.google.com)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/voqstra.git
cd voqstra
npm install
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Open `.env` and set your Gemini API key:
```env
GEMINI_API_KEY=your_key_here
```

### 3. Start Infrastructure

Start PostgreSQL and Redis via Docker Compose:
```bash
docker compose up -d
```

### 4. Run the Application

You can start the Express API and BullMQ worker together using concurrently:
```bash
npm run dev:all
```

Alternatively, you can run them in separate terminals:
```bash
# Terminal 1 - API server (auto-migrates DB on first run)
npm run dev

# Terminal 2 - BullMQ worker
npm run worker
```

### 5. Access the Dashboard

Open your browser and navigate to:
```text
http://localhost:3000
```

---

## API Reference

### Upload a call recording

```bash
curl -X POST http://localhost:3000/api/calls/upload \
  -F "audio=@sample.wav" \
  -F "customer_name=Jane Smith" \
  -F "customer_email=jane@example.com" \
  -F "customer_phone=+1234567890"
```

**Response:**
```json
{
  "message": "Call uploaded successfully. Processing started.",
  "call_id": "uuid-here",
  "job_id": "1",
  "status": "pending",
  "check_status": "/api/calls/uuid-here"
}
```

### Get call status & insights

```bash
curl http://localhost:3000/api/calls/{call_id}
```

### List all calls

```bash
curl http://localhost:3000/api/calls
```

### Health check

```bash
curl http://localhost:3000/api/calls/health
```

---

## Database Schema

- **calls:** id, customer_name, customer_email, customer_phone, audio_filename, status, created_at
- **call_insights:** id, call_id, transcript, sentiment, summary, action_items (JSONB), needs_followup, created_at
- **messages:** id, call_id, recipient_email, channel, message_body, preview_url, sent_at, status

---

## License

MIT License

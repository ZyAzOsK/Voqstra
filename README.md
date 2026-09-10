# Voqstra — Smart Call Analytics & Auto-Follow-Up System

> Upload a call recording, transcribe & analyze it with AI, and automatically send a follow-up email based on extracted action items.

[![Node.js](https://img.shields.io/badge/Node.js-25.x-339933?logo=node.js)](https://nodejs.org)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?logo=google)](https://aistudio.google.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io)
[![BullMQ](https://img.shields.io/badge/BullMQ-5-FF6B35)](https://bullmq.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)

---

## What It Does

1. **Upload** a call audio file (MP3, WAV, M4A, etc.) via REST API
2. **Queue** the job with BullMQ + Redis for async processing
3. **Analyze** with Gemini 2.5 Flash (multimodal inference — one call does transcription + AI analysis)
4. **Store** transcript, sentiment, summary, and action items in PostgreSQL
5. **Auto-send** a follow-up email (via Ethereal test SMTP) if the AI identifies that the call requires a follow-up
6. **Review Insights Anywhere** via the web dashboard or the **React Native mobile client** (iOS & Android) with speaker diarization, sentiment scores, and queue tracking

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
[Express API] <=====> [Mobile Client (Expo / React Native)]
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
| **Mobile Client** | React Native (Expo SDK 57) + TypeScript |
| **Mobile Navigation** | React Navigation v7 (Native Stack) |
| **Mobile Storage** | AsyncStorage (Persisted JWT sessions) |
| **AI Analysis** | Google Gemini 2.5 Flash API (free tier) |
| **Database** | PostgreSQL 16 |
| **Job Queue** | BullMQ + Redis 7 |
| **Email Service** | Nodemailer + Ethereal Email |
| **Logging** | Winston |
| **Containers** | Docker Compose |

---

## Mobile Client (React Native / Expo)

A cross-platform mobile companion client for Voqstra located in the [`mobile/`](./mobile) directory, built with **React Native (Expo SDK 57)** and **TypeScript**. Designed for field agents and managers to review call insights, sentiment metrics, and queue processing statuses on the go.

### Mobile Features

- **Authentication & Session Persistence:**
  - Branded login screen matching Voqstra's purple design system.
  - JWT token storage via `@react-native-async-storage/async-storage` with automatic session restore on app launch.
  - One-tap demo credential autofill (`demo@voqstra.app` / `demo123`).
- **Call List Screen:**
  - Real-time list matching PostgreSQL call records.
  - Dynamic **Sentiment Badges** (Positive: green, Neutral: slate, Negative: red) with normalized sentiment scores (`-1.0` to `+1.0`).
  - **Status Chips** (`COMPLETED`, `PROCESSING`, `FAILED`, `PENDING`).
  - Pull-to-refresh (`RefreshControl`) and cache hydration.
- **Call Detail Screen:**
  - Full call metadata (duration, timestamp, customer contact details).
  - AI analysis breakdown: sentiment score gauge, executive summary, and actionable tags.
  - Checklist of extracted AI follow-up action items.
  - Full audio transcript with speaker diarization (`Agent` vs `Customer`) and timestamps.
  - BullMQ background queue live status indicator for actively processing audio jobs.
- **Dual API Mode (Mock & Live):**
  - **Mock Mode (`EXPO_PUBLIC_API_MODE=mock`):** Works out of the box with realistic call records for instant offline testing and recruiter review without requiring the backend server to be running.
  - **Live Mode (`EXPO_PUBLIC_API_MODE=live`):** Connects directly to the live Voqstra Express REST API.

### Mobile Directory Structure

```text
mobile/
├── App.tsx                    # App root (SafeArea, Auth, and Navigation providers)
├── index.ts                   # Expo root entry point
├── .env                       # Mobile environment variables
├── package.json               # Expo SDK 57 dependencies
└── src/
    ├── api/
    │   ├── client.ts          # Axios client with request/response JWT interceptors
    │   ├── types.ts           # TypeScript interfaces matching PostgreSQL schema
    │   ├── calls.ts           # Typed API service (mock/live toggle)
    │   └── mock.ts            # Realistic mock call records for standalone testing
    ├── auth/
    │   ├── AuthContext.tsx    # React Context for auth state & session restore
    │   └── storage.ts         # AsyncStorage token & user persistence
    ├── components/
    │   ├── CallCard.tsx       # Interactive card component with sentiment/status
    │   ├── SentimentBadge.tsx # Color-coded sentiment badge with score
    │   └── StatusChip.tsx     # Processing status indicator chip
    ├── navigation/
    │   └── RootNavigator.tsx  # Native stack navigator (auth-guarded routes)
    ├── screens/
    │   ├── LoginScreen.tsx    # Branded login screen with demo button
    │   ├── CallListScreen.tsx # Paginated/pull-to-refresh call list
    │   └── CallDetailScreen.tsx # Comprehensive transcript & analysis view
    └── theme/
        └── colors.ts          # Voqstra purple color palette & styling tokens
```

### Running the Mobile Client

```bash
# 1. Navigate to the mobile app directory
cd mobile

# 2. Install dependencies
npm install

# 3. Start Expo Bundler
npx expo start -c
```

- **Physical Device:** Scan the QR code with **Expo Go** (Android / iOS).
- **Android Emulator:** Press `a` in the terminal.
- **iOS Simulator:** Press `i` in the terminal.
- **Demo Credentials:** Tap **"Fill Demo Credentials"** or use `demo@voqstra.app` / `demo123`.

---

## Quick Start (Backend & Web)

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

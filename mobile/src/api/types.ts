/**
 * TypeScript interfaces that mirror the backend's PostgreSQL schema and
 * the exact JSON shapes returned by each Express route in /src/routes/calls.js.
 *
 * Any change to the backend SQL schema should be reflected here.
 */

// ---------------------------------------------------------------------------
// calls table + joined call_insights columns
// Returned by: GET /api/calls
// ---------------------------------------------------------------------------

export interface Call {
  id: string;                              // UUID, PK
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  audio_filename: string;
  duration_seconds: number | null;
  status: 'pending' | 'processing' | 'done' | 'failed';
  created_at: string;                      // ISO 8601

  // Joined from call_insights via LEFT JOIN in the list query
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  summary: string | null;
  needs_followup: boolean | null;
  followup_count: string;                  // PostgreSQL COUNT() returns a string
}

export interface CallListResponse {
  calls: Call[];
  count: number;
}

// ---------------------------------------------------------------------------
// call_insights table
// Returned by: GET /api/calls/:id  (insights field)
// ---------------------------------------------------------------------------

export interface CallInsight {
  id: string;
  call_id: string;
  transcript: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  action_items: string[];   // stored as JSONB, deserialized to string[]
  needs_followup: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// messages table
// Returned by: GET /api/calls/:id  (messages field)
// ---------------------------------------------------------------------------

export interface Message {
  id: string;
  call_id: string;
  recipient_email: string;
  channel: string;          // e.g. 'email'
  message_body: string;
  preview_url: string | null;
  sent_at: string;
  status: string;
}

// ---------------------------------------------------------------------------
// GET /api/calls/:id  — full detail response
// ---------------------------------------------------------------------------

export interface CallDetailResponse {
  call: Call;
  insights: CallInsight | null;   // null if still pending/processing/failed
  messages: Message[];
}

// ---------------------------------------------------------------------------
// POST /api/calls/upload  — upload response
// ---------------------------------------------------------------------------

export interface UploadResponse {
  message: string;
  call_id: string;
  job_id: string;
  status: 'pending';
  check_status: string;
}

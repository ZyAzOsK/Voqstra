/**
 * Mock data layer.
 *
 * Returns realistic hardcoded call records with the same shapes as the real
 * API responses. Used when EXPO_PUBLIC_API_MODE=mock (the default).
 *
 * Swapping to live data only requires changing the env var — no code changes.
 */

import type { Call, CallDetailResponse, CallInsight, Message } from './types';

// Simulate network latency so the loading states are visible during demos
const SIMULATED_DELAY_MS = 350;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const MOCK_CALLS: Call[] = [
  {
    id: 'c1a2b3c4-0001-0000-0000-000000000001',
    customer_name: 'Sarah Mitchell',
    customer_email: 'sarah.mitchell@acmecorp.com',
    customer_phone: '+91-98765-43210',
    audio_filename: '1720000001-call.mp3',
    duration_seconds: 312,
    status: 'done',
    created_at: '2026-09-08T09:15:00.000Z',
    sentiment: 'positive',
    summary: 'Sarah expressed strong interest in the enterprise plan and requested a pricing document.',
    needs_followup: true,
    followup_count: '1',
  },
  {
    id: 'c1a2b3c4-0002-0000-0000-000000000002',
    customer_name: 'Raj Patel',
    customer_email: 'raj.patel@techstart.io',
    customer_phone: '+91-99887-66543',
    audio_filename: '1720000002-call.mp3',
    duration_seconds: 178,
    status: 'done',
    created_at: '2026-09-08T11:40:00.000Z',
    sentiment: 'negative',
    summary: 'Raj was unhappy with response times and threatened to cancel. Needs urgent callback.',
    needs_followup: true,
    followup_count: '1',
  },
  {
    id: 'c1a2b3c4-0003-0000-0000-000000000003',
    customer_name: 'Ayesha Khan',
    customer_email: 'ayesha.khan@designhub.in',
    customer_phone: null,
    audio_filename: '1720000003-call.mp3',
    duration_seconds: 95,
    status: 'done',
    created_at: '2026-09-09T14:20:00.000Z',
    sentiment: 'neutral',
    summary: 'General inquiry about API integration docs. No commitment or follow-up required.',
    needs_followup: false,
    followup_count: '0',
  },
  {
    id: 'c1a2b3c4-0004-0000-0000-000000000004',
    customer_name: 'Vikram Nair',
    customer_email: 'vikram@softedge.dev',
    customer_phone: '+91-88001-23456',
    audio_filename: '1720000004-call.mp3',
    duration_seconds: null,
    status: 'processing',
    created_at: '2026-09-10T08:05:00.000Z',
    sentiment: null,
    summary: null,
    needs_followup: null,
    followup_count: '0',
  },
  {
    id: 'c1a2b3c4-0005-0000-0000-000000000005',
    customer_name: 'Priya Sharma',
    customer_email: 'priya.sharma@globalretail.com',
    customer_phone: '+91-70012-98765',
    audio_filename: '1720000005-call.mp3',
    duration_seconds: null,
    status: 'pending',
    created_at: '2026-09-10T11:55:00.000Z',
    sentiment: null,
    summary: null,
    needs_followup: null,
    followup_count: '0',
  },
  {
    id: 'c1a2b3c4-0006-0000-0000-000000000006',
    customer_name: 'David Chen',
    customer_email: 'david.chen@fintech.sg',
    customer_phone: '+65-9123-4567',
    audio_filename: '1720000006-call.mp3',
    duration_seconds: null,
    status: 'failed',
    created_at: '2026-09-09T17:30:00.000Z',
    sentiment: null,
    summary: null,
    needs_followup: null,
    followup_count: '0',
  },
];

const MOCK_INSIGHTS: Record<string, CallInsight> = {
  'c1a2b3c4-0001-0000-0000-000000000001': {
    id: 'i0000001-0000-0000-0000-000000000001',
    call_id: 'c1a2b3c4-0001-0000-0000-000000000001',
    transcript: `Agent: Thank you for calling Voqstra. How can I help you today?
Sarah: Hi, I saw your product demo and I'm really impressed. We are a team of 200 and need something scalable.
Agent: Absolutely. Our enterprise plan handles that with ease. Can I send you the pricing document?
Sarah: Yes, please. Also, can we schedule a follow-up call next week?
Agent: Of course. I'll have it in your inbox by end of day.`,
    sentiment: 'positive',
    summary:
      'Sarah Mitchell from Acme Corp expressed strong interest in the enterprise plan for a team of 200. She requested the pricing document and a follow-up demo call.',
    action_items: [
      'Send enterprise pricing document to sarah.mitchell@acmecorp.com',
      'Schedule demo call for next week',
    ],
    needs_followup: true,
    created_at: '2026-09-08T09:22:00.000Z',
  },
  'c1a2b3c4-0002-0000-0000-000000000002': {
    id: 'i0000002-0000-0000-0000-000000000002',
    call_id: 'c1a2b3c4-0002-0000-0000-000000000002',
    transcript: `Raj: I've been waiting 48 hours for support. This is unacceptable.
Agent: I sincerely apologise, Mr. Patel. Let me escalate this right now.
Raj: If this isn't resolved by tomorrow, I'm cancelling.
Agent: Understood. I'll personally follow up with you within the hour.`,
    sentiment: 'negative',
    summary:
      'Raj Patel is frustrated with slow support response times and has threatened to cancel his subscription. Urgent escalation and callback required.',
    action_items: [
      "Escalate Raj Patel's open ticket to Tier-2 support",
      'Callback within 1 hour',
      'Offer SLA credit as goodwill gesture',
    ],
    needs_followup: true,
    created_at: '2026-09-08T11:47:00.000Z',
  },
  'c1a2b3c4-0003-0000-0000-000000000003': {
    id: 'i0000003-0000-0000-0000-000000000003',
    call_id: 'c1a2b3c4-0003-0000-0000-000000000003',
    transcript: `Ayesha: Hi, I just wanted to check — do you have REST API docs?
Agent: Yes, they're at docs.voqstra.app. We also have a Postman collection.
Ayesha: Great, thanks. That's all I needed.`,
    sentiment: 'neutral',
    summary:
      'Ayesha Khan inquired about API documentation. Agent directed her to docs.voqstra.app. No follow-up action required.',
    action_items: [],
    needs_followup: false,
    created_at: '2026-09-09T14:25:00.000Z',
  },
};

const MOCK_MESSAGES: Record<string, Message[]> = {
  'c1a2b3c4-0001-0000-0000-000000000001': [
    {
      id: 'm0000001-0000-0000-0000-000000000001',
      call_id: 'c1a2b3c4-0001-0000-0000-000000000001',
      recipient_email: 'sarah.mitchell@acmecorp.com',
      channel: 'email',
      message_body:
        'Hi Sarah,\n\nThank you for your call today! We\'ve attached the enterprise pricing document...',
      preview_url: 'https://ethereal.email/message/mock-preview-001',
      sent_at: '2026-09-08T09:23:00.000Z',
      status: 'sent',
    },
  ],
  'c1a2b3c4-0002-0000-0000-000000000002': [
    {
      id: 'm0000002-0000-0000-0000-000000000002',
      call_id: 'c1a2b3c4-0002-0000-0000-000000000002',
      recipient_email: 'raj.patel@techstart.io',
      channel: 'email',
      message_body: 'Hi Raj,\n\nWe sincerely apologise for the delay. Your ticket has been escalated...',
      preview_url: 'https://ethereal.email/message/mock-preview-002',
      sent_at: '2026-09-08T11:48:00.000Z',
      status: 'sent',
    },
  ],
};

// ---------------------------------------------------------------------------
// Public API — same signatures as calls.ts
// ---------------------------------------------------------------------------

export async function mockGetCalls(): Promise<{ calls: Call[]; count: number }> {
  await delay();
  return { calls: MOCK_CALLS, count: MOCK_CALLS.length };
}

export async function mockGetCallById(id: string): Promise<CallDetailResponse> {
  await delay();

  const call = MOCK_CALLS.find((c) => c.id === id);
  if (!call) {
    throw new Error(`Call not found: ${id}`);
  }

  return {
    call,
    insights: MOCK_INSIGHTS[id] ?? null,
    messages: MOCK_MESSAGES[id] ?? [],
  };
}

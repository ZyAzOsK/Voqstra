/**
 * Public API functions for the call-analytics data.
 *
 * When EXPO_PUBLIC_API_MODE=mock (the default), all calls are routed to the
 * local mock layer so the app works offline with no backend running.
 * Set EXPO_PUBLIC_API_MODE=live to hit the real Voqstra Express API.
 */

import { apiClient } from './client';
import { mockGetCallById, mockGetCalls } from './mock';
import type { CallDetailResponse, CallListResponse } from './types';

const IS_MOCK = process.env.EXPO_PUBLIC_API_MODE !== 'live';

// GET /api/calls — returns all calls (last 50), newest first
export async function getCalls(): Promise<CallListResponse> {
  if (IS_MOCK) return mockGetCalls();

  const { data } = await apiClient.get<CallListResponse>('/api/calls');
  return data;
}

// GET /api/calls/:id — full call detail including insights and messages
export async function getCallById(id: string): Promise<CallDetailResponse> {
  if (IS_MOCK) return mockGetCallById(id);

  const { data } = await apiClient.get<CallDetailResponse>(`/api/calls/${id}`);
  return data;
}

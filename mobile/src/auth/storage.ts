import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Call } from '../api/types';

const TOKEN_KEY = '@voqstra/token';
const CACHE_KEY = '@voqstra/calls_cache';

// --- Auth token ---

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// --- Offline call list cache ---

export async function getCachedCalls(): Promise<Call[] | null> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Call[];
  } catch {
    return null;
  }
}

export async function setCachedCalls(calls: Call[]): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(calls));
}

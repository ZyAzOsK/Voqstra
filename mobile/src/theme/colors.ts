/**
 * Voqstra design tokens.
 * Kept in one file so every screen references the same values —
 * no magic colour strings scattered around the codebase.
 */

export const colors = {
  // Brand
  primary: '#6d28d9',
  primaryLight: '#8b5cf6',
  primaryDark: '#5b21b6',

  // Backgrounds
  background: '#f8f7ff',
  surface: '#ffffff',
  surfaceElevated: '#f3f0ff',

  // Text
  text: '#1f2937',
  textSecondary: '#6b7280',
  textInverted: '#ffffff',

  // Status — matches the `status` field in the calls table
  pending: '#f59e0b',
  processing: '#3b82f6',
  done: '#10b981',
  failed: '#ef4444',

  // Sentiment — matches the `sentiment` field in call_insights
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',

  // UI chrome
  border: '#e5e7eb',
  separator: '#f3f4f6',
  error: '#ef4444',
  errorLight: '#fef2f2',
} as const;

export type Color = keyof typeof colors;

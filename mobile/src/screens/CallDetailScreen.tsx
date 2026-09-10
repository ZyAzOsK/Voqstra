import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { getCallById } from '../api/calls';
import type { CallDetailResponse } from '../api/types';
import SentimentBadge from '../components/SentimentBadge';
import StatusChip from '../components/StatusChip';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'CallDetail'>;

export default function CallDetailScreen({ route }: Props): React.JSX.Element {
  const { callId } = route.params;

  const [detail, setDetail] = useState<CallDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCallById(callId);
      setDetail(data);
    } catch {
      setError('Could not load call details.');
    } finally {
      setIsLoading(false);
    }
  }, [callId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Something went wrong.'}</Text>
        <Pressable style={styles.retryButton} onPress={fetchDetail}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  const { call, insights, messages } = detail;
  const isPending = call.status === 'pending' || call.status === 'processing';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Customer info ─────────────────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.customerName}>{call.customer_name}</Text>
        <Text style={styles.meta}>{call.customer_email}</Text>
        {call.customer_phone && (
          <Text style={styles.meta}>{call.customer_phone}</Text>
        )}
        <View style={styles.chipRow}>
          <StatusChip status={call.status} />
          <SentimentBadge sentiment={call.sentiment} />
        </View>
      </View>

      {/* ── Processing state ──────────────────────────────────────────── */}
      {isPending && (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingText}>
            {call.status === 'processing'
              ? '⏳ Gemini is analysing this call…'
              : '🕐 Waiting in queue for processing'}
          </Text>
          <Pressable style={styles.refreshButton} onPress={fetchDetail}>
            <Text style={styles.refreshText}>↻ Refresh</Text>
          </Pressable>
        </View>
      )}

      {/* ── AI Insights (only when done) ─────────────────────────────── */}
      {insights && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Sentiment</Text>
          </View>
          <View style={[styles.card, styles.centeredCard]}>
            <SentimentBadge sentiment={insights.sentiment} size="lg" />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Summary</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.bodyText}>{insights.summary}</Text>
          </View>

          {insights.action_items.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Action Items</Text>
              </View>
              <View style={styles.card}>
                {insights.action_items.map((item, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bodyText}>{item}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transcript</Text>
          </View>
          <View style={styles.card}>
            <Text
              style={styles.transcriptText}
              numberOfLines={transcriptExpanded ? undefined : 5}
            >
              {insights.transcript}
            </Text>
            <Pressable onPress={() => setTranscriptExpanded((e) => !e)}>
              <Text style={styles.expandToggle}>
                {transcriptExpanded ? 'Show less ↑' : 'Show full transcript ↓'}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {/* ── Follow-up messages ───────────────────────────────────────── */}
      {messages.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Follow-up Messages</Text>
          </View>
          {messages.map((msg) => (
            <View key={msg.id} style={styles.card}>
              <Text style={styles.metaBold}>📧 {msg.recipient_email}</Text>
              <Text style={styles.meta}>
                {new Date(msg.sent_at).toLocaleString('en-IN', {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </Text>
              {msg.preview_url && (
                <Text style={styles.previewLink} numberOfLines={1}>
                  Preview: {msg.preview_url}
                </Text>
              )}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  centeredCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaBold: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  bodyText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    flex: 1,
  },
  transcriptText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  expandToggle: {
    marginTop: 10,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 20,
  },
  pendingCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    gap: 10,
  },
  pendingText: {
    fontSize: 14,
    color: colors.text,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  refreshText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  previewLink: {
    marginTop: 6,
    fontSize: 12,
    color: colors.primary,
  },
  errorText: {
    color: colors.error,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

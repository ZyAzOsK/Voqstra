import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { Call } from '../api/types';
import SentimentBadge from './SentimentBadge';
import StatusChip from './StatusChip';

interface Props {
  call: Call;
  onPress: () => void;
}

// Format ISO date to a human-readable "Sep 8, 09:15" string
function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CallCard({ call, onPress }: Props): React.JSX.Element {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View call from ${call.customer_name}`}
    >
      {/* Top row: name + date */}
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>
          {call.customer_name}
        </Text>
        <Text style={styles.date}>{formatDate(call.created_at)}</Text>
      </View>

      <Text style={styles.email} numberOfLines={1}>
        {call.customer_email}
      </Text>

      {/* Bottom row: sentiment + status */}
      <View style={[styles.row, styles.badgeRow]}>
        <SentimentBadge sentiment={call.sentiment} />
        <StatusChip status={call.status} />
      </View>

      {call.needs_followup && (
        <Text style={styles.followupNote}>📧 Follow-up sent</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    // Shadow (Android)
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    marginTop: 10,
    gap: 8,
    justifyContent: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  email: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  followupNote: {
    marginTop: 8,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});

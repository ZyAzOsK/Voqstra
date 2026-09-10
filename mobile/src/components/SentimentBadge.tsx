import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Sentiment = 'positive' | 'negative' | 'neutral' | null;

interface Props {
  sentiment: Sentiment;
  size?: 'sm' | 'lg';
}

const LABEL: Record<NonNullable<Sentiment>, string> = {
  positive: '😊 Positive',
  negative: '😟 Negative',
  neutral: '😐 Neutral',
};

const BG_COLOR: Record<NonNullable<Sentiment>, string> = {
  positive: colors.positive,
  negative: colors.negative,
  neutral: colors.neutral,
};

export default function SentimentBadge({ sentiment, size = 'sm' }: Props): React.JSX.Element {
  if (!sentiment) {
    return (
      <View style={[styles.badge, styles.pending, size === 'lg' && styles.large]}>
        <Text style={[styles.label, size === 'lg' && styles.largeLabel]}>— Pending</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: BG_COLOR[sentiment] }, size === 'lg' && styles.large]}>
      <Text style={[styles.label, size === 'lg' && styles.largeLabel]}>
        {LABEL[sentiment]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  large: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  pending: {
    backgroundColor: colors.neutral,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  largeLabel: {
    fontSize: 16,
  },
});

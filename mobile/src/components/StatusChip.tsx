import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { Call } from '../api/types';

type Status = Call['status'];

const LABEL: Record<Status, string> = {
  pending: 'Pending',
  processing: 'Processing…',
  done: 'Done',
  failed: 'Failed',
};

const BG_COLOR: Record<Status, string> = {
  pending: colors.pending,
  processing: colors.processing,
  done: colors.done,
  failed: colors.failed,
};

interface Props {
  status: Status;
}

export default function StatusChip({ status }: Props): React.JSX.Element {
  return (
    <View style={[styles.chip, { backgroundColor: BG_COLOR[status] + '22' }]}>
      <View style={[styles.dot, { backgroundColor: BG_COLOR[status] }]} />
      <Text style={[styles.label, { color: BG_COLOR[status] }]}>{LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

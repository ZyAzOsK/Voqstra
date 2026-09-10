import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { getCalls } from '../api/calls';
import { getCachedCalls, setCachedCalls } from '../auth/storage';
import { useAuth } from '../auth/AuthContext';
import type { Call } from '../api/types';
import CallCard from '../components/CallCard';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'CallList'>;

export default function CallListScreen({ navigation }: Props): React.JSX.Element {
  const { logout, user } = useAuth();

  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);

    try {
      const { calls: fetched } = await getCalls();
      setCalls(fetched);
      setError(null);
      // Cache to AsyncStorage for offline access
      await setCachedCalls(fetched);
    } catch {
      // Fallback to cached data if network fails
      const cached = await getCachedCalls();
      if (cached) {
        setCalls(cached);
        setError('Showing cached data — could not reach server.');
      } else {
        setError('Could not load calls. Start the Voqstra backend or check your connection.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  // Add a logout button to the header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      ),
    });
  }, [navigation, logout]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user && (
        <Text style={styles.greeting}>Welcome, {user.name}</Text>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={calls}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CallCard
            call={item}
            onPress={() =>
              navigation.navigate('CallDetail', {
                callId: item.id,
                customerName: item.customer_name,
              })
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchCalls(true)}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={calls.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No call records yet.</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  greeting: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  errorBanner: {
    margin: 16,
    padding: 12,
    backgroundColor: colors.errorLight,
    borderRadius: 10,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  logoutButton: {
    paddingHorizontal: 4,
  },
  logoutText: {
    color: colors.textInverted,
    fontSize: 14,
    fontWeight: '500',
  },
});

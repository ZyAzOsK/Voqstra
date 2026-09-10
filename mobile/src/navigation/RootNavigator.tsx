import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import CallListScreen from '../screens/CallListScreen';
import CallDetailScreen from '../screens/CallDetailScreen';
import { colors } from '../theme/colors';

// ---------------------------------------------------------------------------
// Route param types — shared between screens for type-safe navigation
// ---------------------------------------------------------------------------

export type RootStackParamList = {
  Login: undefined;
  CallList: undefined;
  CallDetail: { callId: string; customerName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator(): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  // Show a spinner while AsyncStorage hydrates auth state on first launch
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverted,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {isAuthenticated ? (
        // Authenticated stack
        <>
          <Stack.Screen
            name="CallList"
            component={CallListScreen}
            options={{ title: 'Voqstra', headerLargeTitle: true }}
          />
          <Stack.Screen
            name="CallDetail"
            component={CallDetailScreen}
            options={({ route }) => ({ title: route.params.customerName })}
          />
        </>
      ) : (
        // Unauthenticated stack
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

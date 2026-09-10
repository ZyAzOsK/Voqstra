import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/auth/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

/**
 * App root.
 *
 * Hierarchy:
 *   SafeAreaProvider      — safe area insets for notch/status bar
 *     AuthProvider        — global auth state + session restore
 *       NavigationContainer — React Navigation
 *         RootNavigator   — login vs authenticated screens
 */
export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

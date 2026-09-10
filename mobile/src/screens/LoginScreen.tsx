import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme/colors';

export default function LoginScreen(): React.JSX.Element {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(): Promise<void> {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      // On success, RootNavigator will automatically switch to the CallList
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Brand header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🎙 Voqstra</Text>
        <Text style={styles.tagline}>Smart Call Analytics</Text>
      </View>

      {/* Form card */}
      <View style={styles.card}>
        <Text style={styles.title}>Sign in</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="demo@voqstra.app"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          testID="login-email"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          autoComplete="password"
          testID="login-password"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isSubmitting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isSubmitting}
          testID="login-submit"
        >
          {isSubmitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Sign In</Text>}
        </Pressable>

        <Text style={styles.hint}>Demo: demo@voqstra.app / demo123</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 4,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  errorText: {
    marginTop: 12,
    color: colors.error,
    fontSize: 13,
    backgroundColor: colors.errorLight,
    padding: 10,
    borderRadius: 8,
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
  },
});

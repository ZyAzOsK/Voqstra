import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { clearToken, getToken, setToken } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface User {
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;  // true while checking AsyncStorage on first launch
  user: User | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

// ---------------------------------------------------------------------------
// Simulated credentials
// The backend has no auth endpoint, so we validate locally and produce a
// fake JWT-shaped token. The Axios client sends it as Bearer — the backend
// ignores it today, but the pattern is correct for when real auth is added.
// ---------------------------------------------------------------------------

const DEMO_CREDENTIALS = {
  email: 'demo@voqstra.app',
  password: 'demo123',
  name: 'Demo User',
};

function makeFakeJwt(email: string): string {
  // Not cryptographically valid — purely for demonstrating the auth flow.
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({ sub: email, iat: Date.now(), exp: Date.now() + 86_400_000 })
  );
  return `${header}.${payload}.demo_signature`;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  // Restore session from AsyncStorage when the app mounts
  useEffect(() => {
    (async (): Promise<void> => {
      const token = await getToken();
      if (token) {
        setState({ isAuthenticated: true, isLoading: false, user: { email: DEMO_CREDENTIALS.email, name: DEMO_CREDENTIALS.name } });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (
      email.trim().toLowerCase() !== DEMO_CREDENTIALS.email ||
      password !== DEMO_CREDENTIALS.password
    ) {
      throw new Error('Invalid credentials. Use demo@voqstra.app / demo123');
    }

    const token = makeFakeJwt(email);
    await setToken(token);

    setState({
      isAuthenticated: true,
      isLoading: false,
      user: { email, name: DEMO_CREDENTIALS.name },
    });
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setState({ isAuthenticated: false, isLoading: false, user: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook — throws at the call site if used outside <AuthProvider>
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

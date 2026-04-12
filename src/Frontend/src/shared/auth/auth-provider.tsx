import { useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { User, UserRole } from '@/shared/types';
import { setTokenProvider } from '@/shared/api/http-client';
import { AuthContext, type AuthContextValue } from './auth-context';

const DEV_USER: User = {
  id: 'dev-user-001',
  displayName: 'Dev User',
  email: 'dev@travelbookings.com',
  roles: ['Traveler', 'EventOrganizer', 'FinanceAdmin', 'Manager', 'Admin'],
};

const DEV_ACCESS_TOKEN = 'dev-access-token';

function createDevAuthProvider(): {
  user: User;
  accessToken: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;
  hasRole: (role: UserRole) => boolean;
} {
  return {
    user: DEV_USER,
    accessToken: DEV_ACCESS_TOKEN,
    isAuthenticated: true,
    isLoading: false,
    login: async () => {
      // No-op in dev mode; already authenticated
    },
    logout: async () => {
      // No-op in dev mode
    },
    getAccessToken: async () => DEV_ACCESS_TOKEN,
    hasRole: (role: UserRole) => DEV_USER.roles.includes(role),
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const login = useCallback(async () => {
    if (import.meta.env.DEV) {
      setUser(DEV_USER);
      setAccessToken(DEV_ACCESS_TOKEN);
      return;
    }

    // Production: MSAL.js login would go here
    // e.g., await msalInstance.loginRedirect(loginRequest);
    throw new Error('Production MSAL authentication not yet configured');
  }, []);

  const logout = useCallback(async () => {
    if (import.meta.env.DEV) {
      setUser(null);
      setAccessToken(null);
      return;
    }

    // Production: MSAL.js logout would go here
    // e.g., await msalInstance.logoutRedirect();
    throw new Error('Production MSAL authentication not yet configured');
  }, []);

  const getAccessToken = useCallback(async (): Promise<string> => {
    if (import.meta.env.DEV) {
      return DEV_ACCESS_TOKEN;
    }

    // Production: acquire token silently via MSAL
    // e.g., const result = await msalInstance.acquireTokenSilent(tokenRequest);
    // return result.accessToken;
    throw new Error('Production MSAL authentication not yet configured');
  }, []);

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      if (!user) return false;
      return user.roles.includes(role);
    },
    [user],
  );

  // Initialize authentication state
  useEffect(() => {
    if (import.meta.env.DEV) {
      const devAuth = createDevAuthProvider();
      setUser(devAuth.user);
      setAccessToken(devAuth.accessToken);
      setIsLoading(false);
    } else {
      // Production: check MSAL cached accounts
      // const accounts = msalInstance.getAllAccounts();
      // if (accounts.length > 0) { ... }
      setIsLoading(false);
    }
  }, []);

  // Set up the token provider for the http-client whenever getAccessToken changes
  useEffect(() => {
    if (isAuthenticated) {
      setTokenProvider(getAccessToken);
    }
  }, [isAuthenticated, getAccessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      accessToken,
      login,
      logout,
      getAccessToken,
      hasRole,
    }),
    [user, isAuthenticated, isLoading, accessToken, login, logout, getAccessToken, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

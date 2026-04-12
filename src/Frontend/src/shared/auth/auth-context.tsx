import { createContext } from 'react';
import type { UserRole, AuthState } from '@/shared/types';

export interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;
  hasRole: (role: UserRole) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

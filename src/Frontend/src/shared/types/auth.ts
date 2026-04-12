export type UserRole = 'Traveler' | 'EventOrganizer' | 'FinanceAdmin' | 'Manager' | 'Admin';

export interface User {
  id: string;
  displayName: string;
  email: string;
  roles: UserRole[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

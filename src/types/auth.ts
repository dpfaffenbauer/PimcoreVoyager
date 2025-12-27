/**
 * Authentication Types
 */

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  expires_at?: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: AuthToken | null;
  user: User | null;
}

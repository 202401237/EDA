export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  role: 'customer';
  createdAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin';
}

export type User = CustomerUser | AdminUser;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

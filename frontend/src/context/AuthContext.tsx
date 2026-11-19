import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, CustomerUser, AdminUser } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loginCustomer: (name: string, email: string) => void;
  loginAdmin: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'ii_demo_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const loginCustomer = useCallback((name: string, email: string) => {
    const customer: CustomerUser = {
      id: `cust_${Date.now()}`,
      name,
      email,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setUser(customer);
    // NOTE: sessionStorage is used for demo convenience only.
    // Production must use server-side sessions or JWT from the Spring Boot backend.
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(customer));
  }, []);

  const loginAdmin = useCallback((username: string) => {
    const admin: AdminUser = {
      id: `admin_${Date.now()}`,
      username,
      role: 'admin',
    };
    setUser(admin);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(admin));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginCustomer, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

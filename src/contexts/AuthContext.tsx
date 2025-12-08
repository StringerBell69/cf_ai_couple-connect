import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (username: User, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Temporary passwords for demo - will be replaced with Lovable Cloud auth
const DEMO_PASSWORDS: Record<User, string> = {
  Wendy: 'wendy123',
  Daniel: 'daniel123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check localStorage for persisted session (temporary - will use Lovable Cloud)
    const saved = localStorage.getItem('coupleMemory_user');
    return {
      user: saved as User | null,
      isAuthenticated: !!saved,
    };
  });

  const login = useCallback((username: User, password: string): boolean => {
    if (DEMO_PASSWORDS[username] === password) {
      localStorage.setItem('coupleMemory_user', username);
      setAuthState({ user: username, isAuthenticated: true });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('coupleMemory_user');
    setAuthState({ user: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    phone: string;
    unitNumber: string;
    superBuiltUpSqFt?: number;
    occupancyType: 'OWNER' | 'TENANT';
    occupantCount: number;
    password: string;
    passwordConfirmation?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  quickSwitchAccount: (email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    phone: string;
    unitNumber: string;
    superBuiltUpSqFt?: number;
    occupancyType: 'OWNER' | 'TENANT';
    occupantCount: number;
    password: string;
    passwordConfirmation?: string;
  }) => {
    const res = await api.auth.register(data);
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const quickSwitchAccount = async (email: string, password: string) => {
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        quickSwitchAccount,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

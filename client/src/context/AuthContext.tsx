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
  updateProfile: (data: { fullName?: string; phone?: string }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
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
        localStorage.removeItem('mygate_token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('mygate_token');
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
      if (res.token) {
        localStorage.setItem('mygate_token', res.token);
      }
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
      if (res.token) {
        localStorage.setItem('mygate_token', res.token);
      }
      setUser(res.user);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('mygate_token');
    setUser(null);
  };

  const quickSwitchAccount = async (email: string, password: string) => {
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  const updateProfile = async (data: { fullName?: string; phone?: string }) => {
    const res = await api.auth.updateProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    await api.auth.changePassword(data);
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
        refreshUser,
        updateProfile,
        changePassword
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

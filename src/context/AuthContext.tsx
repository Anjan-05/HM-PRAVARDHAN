import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { api } from '../api.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchDemoUser: (user: User) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  targetRole: UserRole | null;
  openLoginForRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [targetRole, setTargetRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Load persisted session if any
    try {
      const savedUser = localStorage.getItem('hm_platform_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password, role);
      setUser(res.user);
      localStorage.setItem('hm_platform_user', JSON.stringify(res.user));
      setLoginModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hm_platform_user');
  };

  const switchDemoUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('hm_platform_user', JSON.stringify(newUser));
    setLoginModalOpen(false);
  };

  const openLoginForRole = (role: UserRole) => {
    setTargetRole(role);
    setLoginModalOpen(true);
  };

  const role: UserRole = user ? user.role : 'PUBLIC';
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout,
        switchDemoUser,
        loginModalOpen,
        setLoginModalOpen,
        targetRole,
        openLoginForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

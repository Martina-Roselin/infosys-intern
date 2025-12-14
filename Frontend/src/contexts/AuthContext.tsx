import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface AuthContextType {
  token: string | null;
  role: string | null;
  name: string | null;
  userId: number | null;
  login: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [name, setName] = useState<string | null>(localStorage.getItem('name'));
  const [userId, setUserId] = useState<number | null>(() => {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
  });

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setToken(response.token);
    setRole(response.role);
    setName(response.name);
    setUserId(response.id);
    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.role);
    localStorage.setItem('name', response.name);
    localStorage.setItem('userId', response.id.toString());
  };

  const loginAdmin = async (email: string, password: string) => {
    const response = await api.loginAdmin(email, password);
    setToken(response.token);
    setRole(response.role);
    setName(response.name);
    setUserId(response.id);
    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.role);
    localStorage.setItem('name', response.name);
    localStorage.setItem('userId', response.id.toString());
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setName(null);
    setUserId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        name,
        userId,
        login,
        loginAdmin,
        logout,
        isAuthenticated: !!token,
      }}
    >
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

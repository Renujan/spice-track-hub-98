import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'cashier' | 'chef' | 'stock';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo users for testing
const demoUsers: User[] = [
  { id: '1', email: 'admin@spot.lk', name: 'Admin User', role: 'admin' },
  { id: '2', email: 'cashier@spot.lk', name: 'Cashier User', role: 'cashier' },
  { id: '3', email: 'chef@spot.lk', name: 'Chef User', role: 'chef' },
  { id: '4', email: 'stock@spot.lk', name: 'Stock Manager', role: 'stock' },
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple demo authentication - in real app, this would call an API
    const foundUser = demoUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
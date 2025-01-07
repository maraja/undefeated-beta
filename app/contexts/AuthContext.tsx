'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Season } from '../dto/types';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (userData: User) => void;
  logout: () => void;
  currentSeason: Season | null;
  setCurrentSeason: React.Dispatch<React.SetStateAction<Season | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.seasons && parsedUser.seasons.length > 0) {
        setCurrentSeason(parsedUser.seasons[0]);
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.seasons && userData.seasons.length > 0) {
      setCurrentSeason(userData.seasons[0]);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentSeason(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, currentSeason, setCurrentSeason }}>
      {children}
    </AuthContext.Provider>
  );
}


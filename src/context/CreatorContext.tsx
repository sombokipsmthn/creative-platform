// src/context/CreatorContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initialUsersDatabase, UserAccount } from '@/db/users';

interface CreatorContextType {
  activeUser: UserAccount | null;
  usersDb: Record<string, UserAccount>;
  loginUser: (userId: string) => void;
  logoutUser: () => void;
  registerUser: (newUser: UserAccount) => void;
}

const CreatorContext = createContext<CreatorContextType | undefined>(undefined);

export function CreatorProvider({ children }: { children: ReactNode }) {
  const [usersDb, setUsersDb] = useState<Record<string, UserAccount>>(initialUsersDatabase);
  const [activeUser, setActiveUser] = useState<UserAccount | null>(null); // 💡 Default: Logged Out (null)

  useEffect(() => {
    // Check if user is logged in via cookie
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/active_creator_id=([^;]+)/);
      const session = document.cookie.match(/creator_session=authenticated/);
      
      if (session && match && match[1] && usersDb[match[1]]) {
        setActiveUser(usersDb[match[1]]);
      } else {
        setActiveUser(null); // Force logged out by default
      }
    }
  }, []);

  const loginUser = (userId: string) => {
    if (usersDb[userId]) {
      setActiveUser(usersDb[userId]);
      document.cookie = `active_creator_id=${userId}; path=/; max-age=86400`;
      document.cookie = `creator_session=authenticated; path=/; max-age=86400`;
    }
  };

  const logoutUser = () => {
    setActiveUser(null);
    document.cookie = 'active_creator_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'creator_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const registerUser = (newUser: UserAccount) => {
    setUsersDb((prev) => ({
      ...prev,
      [newUser.id]: newUser,
    }));
    setActiveUser(newUser);
    document.cookie = `active_creator_id=${newUser.id}; path=/; max-age=86400`;
    document.cookie = `creator_session=authenticated; path=/; max-age=86400`;
  };

  return (
    <CreatorContext.Provider
      value={{
        activeUser,
        usersDb,
        loginUser,
        logoutUser,
        registerUser,
      }}
    >
      {children}
    </CreatorContext.Provider>
  );
}

export function useCreator() {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error('useCreator must be used within a CreatorProvider');
  }
  return context;
}
// src/context/CreatorContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initialUsersDatabase, UserAccount } from '@/db/users';

export type CreatorData = UserAccount; // 💡 Export CreatorData type alias

interface CreatorContextType {
  activeUser: UserAccount | null;
  activeCreator: UserAccount | null;
  usersDb: Record<string, UserAccount>;
  loginUser: (email: string) => boolean;
  logoutUser: () => void;
  registerUser: (newUser: UserAccount) => void;
  registerNewCreator: (newUser: UserAccount) => void;
  updateActiveProfile: (updated: Partial<UserAccount>) => void;
}

const CreatorContext = createContext<CreatorContextType | undefined>(undefined);

export function CreatorProvider({ children }: { children: ReactNode }) {
  const [usersDb, setUsersDb] = useState<Record<string, UserAccount>>(initialUsersDatabase);
  const [activeUser, setActiveUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    // Read session asynchronously to avoid synchronous setState during render
    const timer = setTimeout(() => {
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/active_creator_id=([^;]+)/);
        const session = document.cookie.match(/creator_session=authenticated/);
        
        if (session && match && match[1] && usersDb[match[1]]) {
          setActiveUser(usersDb[match[1]]);
        } else {
          setActiveUser(null);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [usersDb]);

  const loginUser = (email: string) => {
  const user = Object.values(usersDb).find(
    (account) => account.email.toLowerCase() === email.toLowerCase()
  );

  if (user) {
    setActiveUser(user);

    document.cookie = `active_creator_id=${user.id}; path=/; max-age=86400`;
    document.cookie = `creator_session=authenticated; path=/; max-age=86400`;

    return true;
  }

  return false;
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

  const updateActiveProfile = (updated: Partial<UserAccount>) => {
    if (!activeUser) return;
    const updatedUser = { ...activeUser, ...updated };
    setActiveUser(updatedUser);
    setUsersDb((prev) => ({
      ...prev,
      [activeUser.id]: updatedUser,
    }));
  };

  return (
    <CreatorContext.Provider
      value={{
        activeUser,
        activeCreator: activeUser,
        usersDb,
        loginUser,
        logoutUser,
        registerUser,
        registerNewCreator: registerUser,
        updateActiveProfile,
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
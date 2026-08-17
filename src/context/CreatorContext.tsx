'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useUser } from '@clerk/nextjs';

import { initialUsersDatabase, UserAccount } from '@/db/users';

export type CreatorData = UserAccount;

interface CreatorContextType {
  activeUser: UserAccount | null;
  activeCreator: UserAccount | null;
  usersDb: Record<string, UserAccount>;
  registerUser: (newUser: UserAccount) => void;
  registerNewCreator: (newUser: UserAccount) => void;
  updateActiveProfile: (updated: Partial<UserAccount>) => void;
}

const CreatorContext = createContext<CreatorContextType | undefined>(
  undefined
);

export function CreatorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isLoaded, isSignedIn, user } = useUser();

  const [usersDb, setUsersDb] =
    useState<Record<string, UserAccount>>(initialUsersDatabase);

  const [activeUser, setActiveUser] =
    useState<UserAccount | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setActiveUser(null);
      return;
    }

    const email =
      user.primaryEmailAddress?.emailAddress?.toLowerCase() ?? '';

    const matchingUser = Object.values(usersDb).find(
      (account) =>
        account.email.toLowerCase() === email
    );

    if (matchingUser) {
      setActiveUser(matchingUser);
      return;
    }

    const templateUser =
      Object.values(initialUsersDatabase)[0];

    const fallbackUser: UserAccount = {
      ...templateUser,
      id: user.id,
      name:
        user.fullName ||
        user.firstName ||
        email.split('@')[0] ||
        'Creator',
      email,
      avatarUrl: user.imageUrl,
    };

    setUsersDb((previous) => ({
      ...previous,
      [fallbackUser.id]: fallbackUser,
    }));

    setActiveUser(fallbackUser);
  }, [isLoaded, isSignedIn, user, usersDb]);

  useEffect(() => {
    if (!isLoaded || isSignedIn) return;
    setActiveUser(null);
  }, [isLoaded, isSignedIn]);

  const registerUser = (newUser: UserAccount) => {
    setUsersDb((previous) => ({
      ...previous,
      [newUser.id]: newUser,
    }));

    setActiveUser(newUser);
  };

  const updateActiveProfile = (
    updated: Partial<UserAccount>
  ) => {
    if (!activeUser) return;

    const updatedUser: UserAccount = {
      ...activeUser,
      ...updated,
    };

    setActiveUser(updatedUser);

    setUsersDb((previous) => ({
      ...previous,
      [updatedUser.id]: updatedUser,
    }));
  };

  return (
    <CreatorContext.Provider
      value={{
        activeUser,
        activeCreator: activeUser,
        usersDb,
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
    throw new Error(
      'useCreator must be used within a CreatorProvider'
    );
  }

  return context;
}
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

    // Use a functional updater to avoid depending on `usersDb` and
    // to prevent this effect from re-running when usersDb changes.
    setUsersDb((prev) => {
      const matchingUser = Object.values(prev).find(
        (account) => account.email.toLowerCase() === email
      );

      if (matchingUser) {
        setActiveUser(matchingUser);
        return prev;
      }

      const templateUser = Object.values(initialUsersDatabase)[0];

      const fallbackUser: UserAccount = {
        ...templateUser,
        id: user.id,
        name:
          user.fullName || user.firstName || email.split('@')[0] || 'Creator',
        email,
        avatarUrl: user.imageUrl,
      };

      setActiveUser(fallbackUser);

      return {
        ...prev,
        [fallbackUser.id]: fallbackUser,
      };
    });
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (!isLoaded || isSignedIn) return;
    setActiveUser(null);
  }, [isLoaded, isSignedIn]);

  const registerUser = useCallback((newUser: UserAccount) => {
    setUsersDb((previous) => ({
      ...previous,
      [newUser.id]: newUser,
    }));

    setActiveUser(newUser);
  }, []);

  const registerNewCreator = registerUser;

  const updateActiveProfile = useCallback(
    (updated: Partial<UserAccount>) => {
      setUsersDb((previous) => {
        const id = (activeUser && activeUser.id) || (updated as any).id;
        if (!id) return previous;
        const existing = previous[id] ?? activeUser ?? {} as UserAccount;
        const updatedUser: UserAccount = {
          ...existing,
          ...updated,
        };

        // update active user if it's the same id
        if (activeUser?.id === updatedUser.id) {
          setActiveUser(updatedUser);
        }

        return {
          ...previous,
          [updatedUser.id]: updatedUser,
        };
      });
    },
    [activeUser]
  );

  const contextValue = useMemo(
    () => ({
      activeUser,
      activeCreator: activeUser,
      usersDb,
      registerUser,
      registerNewCreator,
      updateActiveProfile,
    }),
    [activeUser, usersDb, registerUser, registerNewCreator, updateActiveProfile]
  );

  return (
    <CreatorContext.Provider value={contextValue}>
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
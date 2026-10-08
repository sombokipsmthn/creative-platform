"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface CreatorProfile {
  id: string;
  userId: string;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  location: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreatorData {
  id: string;
  authUserId: string | null;
  email: string;
  name: string;
  handle: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  profile: CreatorProfile | null;
}

interface CreatorContextType {
  activeUser: CreatorData | null;
  activeCreator: CreatorData | null;
  usersDb: Record<string, CreatorData>;
  loading: boolean;
  registerUser: (creator: CreatorData) => void;
  updateActiveProfile: (
    updated: Partial<CreatorProfile>
  ) => void;
  refreshCreator: () => Promise<void>;
}

const CreatorContext =
  createContext<CreatorContextType | undefined>(
    undefined
  );

export function CreatorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeUser, setActiveUser] =
    useState<CreatorData | null>(null);

  const [usersDb, setUsersDb] = useState<
    Record<string, CreatorData>
  >({});

  const [loading, setLoading] = useState(true);

  const syncCreator = useCallback(async function syncCreator() {
    try {
      const response = await fetch("/api/users/sync", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok || !payload.user) {
        setActiveUser(null);
        setUsersDb({});
        return;
      }

      const creator: CreatorData = {
        ...payload.user,
        profile: payload.profile ?? null,
      };

      setActiveUser(creator);
      setUsersDb({ [creator.id]: creator });
    } catch (error) {
      console.error("CreatorContext sync error:", error);
      setActiveUser(null);
      setUsersDb({});
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * -------------------------------------------------------
   * INITIAL / AUTH CHANGE SYNC
   * -------------------------------------------------------
   */
  useEffect(() => {
    // This effect intentionally hydrates context state from the authenticated session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void syncCreator();
  }, [syncCreator]);

  /*
   * -------------------------------------------------------
   * REGISTER USER
   * -------------------------------------------------------
   *
   * Used after successful onboarding.
   */
  function registerUser(
    creator: CreatorData
  ) {
    setUsersDb((current) => ({
      ...current,
      [creator.id]: creator,
    }));

    setActiveUser(creator);
  }

  /*
   * -------------------------------------------------------
   * UPDATE ACTIVE PROFILE
   * -------------------------------------------------------
   */
  function updateActiveProfile(
    updated: Partial<CreatorProfile>
  ) {
    setActiveUser((current) => {
      if (!current) {
        return current;
      }

      const updatedCreator: CreatorData = {
        ...current,
        profile: current.profile
          ? {
              ...current.profile,
              ...updated,
            }
          : null,
      };

      setUsersDb((users) => ({
        ...users,
        [updatedCreator.id]:
          updatedCreator,
      }));

      return updatedCreator;
    });
  }

  /*
   * -------------------------------------------------------
   * CONTEXT
   * -------------------------------------------------------
   */
  return (
    <CreatorContext.Provider
      value={{
        activeUser,
        activeCreator: activeUser,
        usersDb,
        loading,
        registerUser,
        updateActiveProfile,
        refreshCreator: syncCreator,
      }}
    >
      {children}
    </CreatorContext.Provider>
  );
}

/*
 * ---------------------------------------------------------
 * HOOK
 * ---------------------------------------------------------
 */
export function useCreator() {
  const context = useContext(
    CreatorContext
  );

  if (!context) {
    throw new Error(
      "useCreator must be used within a CreatorProvider"
    );
  }

  return context;
}
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";

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
  authUserId: string;
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
  registerNewCreator: (creator: CreatorData) => void;
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
  const { isLoaded, isSignedIn, user } = useUser();

  const [activeUser, setActiveUser] =
    useState<CreatorData | null>(null);

  const [usersDb, setUsersDb] = useState<
    Record<string, CreatorData>
  >({});

  const [loading, setLoading] = useState(true);

  const syncCreator = useCallback(async function syncCreator() {
    // The context no longer blocks synchronization on the onboarding route.
    // Routing decisions are handled by /auth, so we always attempt to fetch the
    // creator state when Clerk reports the user as signed in.

    /*
     * Clerk has not finished loading yet.
     */
    if (!isLoaded) {
      return;
    }

    /*
     * User is signed out.
     */
    if (!isSignedIn || !user?.id) {
      setActiveUser(null);
      setUsersDb({});
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      /*
       * -------------------------------------------------------
       * SYNC LOCAL CREATOR ACCOUNT
       * -------------------------------------------------------
       */
      const response = await fetch(
        "/api/users/sync",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      /*
       * Handle HTTP errors explicitly.
       *
       * This makes API problems much easier to diagnose
       * than a generic JSON parsing/fetch error.
       */
      if (!response.ok) {
        const text = await response.text();

        console.error(
          "Creator sync HTTP error:",
          response.status,
          text
        );

        throw new Error(
          `Creator sync failed with HTTP ${response.status}`
        );
      }

      const data = await response.json();

      /*
       * -------------------------------------------------------
       * NEW CLERK USER
       * -------------------------------------------------------
       *
       * /api/users/sync does not create a database user.
       *
       * It tells us that onboarding is required.
       */
  if (data.needsOnboarding) {
  setActiveUser(null);
  setUsersDb({});
  setLoading(false);
  return;
}

      /*
       * -------------------------------------------------------
       * NO LOCAL CREATOR
       * -------------------------------------------------------
       */
      if (!data.user) {
        setActiveUser(null);
        setUsersDb({});
        setLoading(false);
        return;
      }

      /*
       * -------------------------------------------------------
       * EXISTING CREATOR
       * -------------------------------------------------------
       */
      const creator: CreatorData = {
        ...data.user,
        profile: data.profile ?? null,
      };

      setActiveUser(creator);

      setUsersDb({
        [creator.id]: creator,
      });
    } catch (error) {
      /*
       * IMPORTANT:
       *
       * Do not redirect here.
       *
       * If the API temporarily fails, redirecting would
       * create another possible navigation loop.
       */
      console.error(
        "CreatorContext sync error:",
        error
      );

      setActiveUser(null);
      setUsersDb({});
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  /*
   * -------------------------------------------------------
   * INITIAL / AUTH CHANGE SYNC
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void syncCreator();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    isLoaded,
    syncCreator,
  ]);

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
        registerNewCreator: registerUser,
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

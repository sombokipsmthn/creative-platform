"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { authClient } from "@/lib/auth-client";

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
  const { data: session, isPending: authPending } = authClient.useSession();
  const sessionUserId = session?.user?.id ?? null;
  const [activeUser, setActiveUser] =
    useState<CreatorData | null>(null);

  const [usersDb, setUsersDb] = useState<
    Record<string, CreatorData>
  >({});

  const [loading, setLoading] = useState(true);
  const currentSessionUserId = useRef(sessionUserId);
  const inFlightSyncs = useRef(new Map<string, Promise<void>>());

  useEffect(() => {
    currentSessionUserId.current = sessionUserId;
  }, [sessionUserId]);

  const syncCreator = useCallback((): Promise<void> => {
    if (!sessionUserId) {
      setActiveUser(null);
      setUsersDb({});
      setLoading(false);
      return Promise.resolve();
    }

    const inFlight = inFlightSyncs.current.get(sessionUserId);
    if (inFlight) return inFlight;

    const userId = sessionUserId;
    setLoading(true);
    const sync = (async () => {
      try {
        const response = await fetch("/api/users/sync", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
        const payload = await response.json();

        if (currentSessionUserId.current !== userId) return;

        if (!response.ok) {
          if (response.status !== 401) {
            console.error("Creator sync failed with status:", response.status);
          }
          setActiveUser(null);
          setUsersDb({});
          return;
        }

        if (!payload.user) {
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
        if (currentSessionUserId.current === userId) {
          console.error("CreatorContext sync error:", error);
          setActiveUser(null);
          setUsersDb({});
        }
      } finally {
        if (currentSessionUserId.current === userId) {
          setLoading(false);
        }
      }
    })();

    inFlightSyncs.current.set(userId, sync);
    void sync.finally(() => {
      if (inFlightSyncs.current.get(userId) === sync) {
        inFlightSyncs.current.delete(userId);
      }
    });

    return sync;
  }, [sessionUserId]);

  /*
   * -------------------------------------------------------
   * INITIAL / AUTH CHANGE SYNC
   * -------------------------------------------------------
   */
  useEffect(() => {
     if (authPending) return;

     // Hydrate only after Better Auth resolves the current session.
     // eslint-disable-next-line react-hooks/set-state-in-effect
     void syncCreator();
   }, [authPending, syncCreator]);

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
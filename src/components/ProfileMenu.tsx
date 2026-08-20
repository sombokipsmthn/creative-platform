
'use client';

import {
  useClerk,
  useUser,
} from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function ProfileMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );

      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, []);

  if (!isLoaded || !user) {
    return null;
  }

  const fullName =
    user.fullName ||
    user.firstName ||
    'Creator';

  const email =
    user.primaryEmailAddress?.emailAddress ||
    '';

  const initials =
    user.firstName?.charAt(0) ||
    user.username?.charAt(0) ||
    email.charAt(0) ||
    'C';

  async function handleSignOut() {
  await signOut({
    redirectUrl: "/",
  });
}

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open profile menu"
        className="flex items-center gap-2 rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
      >
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={fullName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-zinc-700"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-xs font-bold uppercase text-white">
            {initials.toUpperCase()}
          </span>
        )}

        <span
          className={`hidden xl:block transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Profile menu"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-60 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/30"
        >
          <div className="border-b border-slate-100 px-4 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={fullName}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover border border-slate-200 dark:border-zinc-700"
                />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-bold uppercase text-white">
                  {initials.toUpperCase()}
                </span>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {fullName}
                </p>

                {email && (
                  <p className="truncate text-xs text-slate-500 dark:text-zinc-500">
                    {email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link
              href="/admin/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-purple-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-purple-400"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                />
              </svg>

              <span>Profile</span>
            </Link>

            <Link
              href="/admin/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-purple-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-purple-400"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V20h-2.4v-.09a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.55-1.03H6.8v-2.4h.11a1.7 1.7 0 0 0 1.55-1.03 1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.55V5.6h2.4v.11a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1.03h.11v2.4h-.11A1.7 1.7 0 0 0 19.4 15Z" />
              </svg>

              <span>Settings</span>
            </Link>

            <Link
              href="/"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-purple-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-purple-400"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 3h7v7" />
                <path d="M10 14 21 3" />
                <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
              </svg>

              <span>Public Site</span>

              <span className="ml-auto text-xs text-slate-400">
                ↗
              </span>
            </Link>
          </div>

          <div className="border-t border-slate-100 p-2 dark:border-zinc-800">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
              </svg>

              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useCreator } from '@/context/CreatorContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, ExternalLink, LogOut, ChevronDown } from 'lucide-react';

export default function ProfileMenu({ showLabel = false }: { showLabel?: boolean }) {
  const { activeCreator } = useCreator();

  const fullName = activeCreator?.name || 'Creator';
  const email = activeCreator?.email || '';
  const initials = (fullName.charAt(0) || 'C').toUpperCase();
  const avatarUrl = activeCreator?.profile?.avatarUrl;

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = '/';
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open profile menu"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 py-1 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:px-2.5"
        >
          <Avatar className="size-8 shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          {showLabel && (
            <span className="hidden min-w-0 text-left lg:block">
              <span className="block max-w-32 truncate text-sm font-medium text-foreground">
                {fullName}
              </span>
              <span className="block text-xs text-muted-foreground">Creator</span>
            </span>
          )}

          <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{fullName}</p>
            {email && <p className="truncate text-xs font-normal text-muted-foreground">{email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/admin/profile">
            <User aria-hidden="true" />
            <span>Account &amp; Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings">
            <Settings aria-hidden="true" />
            <span>Platform Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/">
            <ExternalLink aria-hidden="true" />
            <span>Public Site</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut aria-hidden="true" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

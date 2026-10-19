'use client';

import Link from 'next/link';
import { authClient } from "@/lib/auth-client";
import { useCreator } from '@/context/CreatorContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
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
          className="flex items-center gap-2 rounded-lg p-1 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
        >
          <Avatar className="h-8 w-8 border border-border">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          {showLabel && (
            <div className="hidden text-left lg:block">
              <span className="block max-w-28 truncate text-xs font-medium text-foreground">
                {fullName}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Creator
              </span>
            </div>
          )}

          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{fullName}</p>
            {email && (
              <p className="text-xs leading-none text-muted-foreground truncate">
                {email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/admin/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Creator Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Platform Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span>Public Site</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

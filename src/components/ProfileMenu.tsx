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
          className=""
        >
          <Avatar className="order">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
            <AvatarFallback className="">
              {initials}
            </AvatarFallback>
          </Avatar>

          {showLabel && (
            <div className="hidden">
              <span className="block">
                {fullName}
              </span>
              <span className="block">
                Creator
              </span>
            </div>
          )}

          <ChevronDown className="" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="">
        <DropdownMenuLabel className="">
          <div className="">
            <p className="">{fullName}</p>
            {email && (
              <p className="">
                {email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/admin/profile" className="">
            <User className="" />
            <span>Account & Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="">
            <Settings className="" />
            <span>Platform Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/" className="">
            <ExternalLink className="" />
            <span>Public Site</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className=""
        >
          <LogOut className="" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

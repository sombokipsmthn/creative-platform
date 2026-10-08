"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useCreator } from "@/context/CreatorContext";

export default function SidebarProfile() {
  const { data: session, isPending } = authClient.useSession();
  const { activeCreator } = useCreator();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (isPending || !session?.user) return null;
  const fullName = activeCreator?.name || session.user.name || "Creator";
  const email = activeCreator?.email || session.user.email;
  const image = activeCreator?.profile?.avatarUrl || session.user.image;
  const initials = fullName.charAt(0).toUpperCase();

  return <div ref={menuRef} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} className="flex items-center gap-3 rounded-full">
      {image ? <Image src={image} alt={fullName} width={36} height={36} unoptimized className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">{initials}</span>}
      <div className="min-w-0 text-left"><p className="truncate text-sm font-semibold">{fullName}</p><p className="truncate text-xs text-slate-500">{email}</p></div>
    </button>
    {open && <div role="menu" className="absolute right-0 top-[calc(100%+0.75rem)] z-60 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"><button type="button" onClick={async () => { await authClient.signOut(); window.location.href = "/"; }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Log out</button></div>}
  </div>;
}

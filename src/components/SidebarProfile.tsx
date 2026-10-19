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

  return <div ref={menuRef} className="">
    <button type="button" onClick={() => setOpen((value) => !value)} className="">
      {image ? <Image src={image} alt={fullName} width={36} height={36} unoptimized className="" /> : <span className="">{initials}</span>}
      <div className=""><p className="">{fullName}</p><p className="">{email}</p></div>
    </button>
    {open && <div role="menu" className=""><button type="button" onClick={async () => { await authClient.signOut(); window.location.href = "/"; }} className="">Log out</button></div>}
  </div>;
}

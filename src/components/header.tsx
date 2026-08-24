"use client";

import Link from "next/link";
import { useCreator } from "@/context/CreatorContext";

export default function Header() {
  const { activeUser } = useCreator();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 pt-5">
        <nav
          className="
            flex items-center justify-between
            rounded-2xl
            border border-slate-200/70
            bg-white/80
            backdrop-blur-xl
            px-6 py-3
            shadow-sm
            dark:border-white/10
            dark:bg-zinc-950/70
          "
        >
          {/* LOGO */}
          <Link
            href="/"
            className="
              text-lg
              font-semibold
              tracking-[0.35em]
              text-slate-900
              dark:text-white
            "
          >
            KIPSMTHN
          </Link>


          {/* NAVIGATION */}
          <div
            className="
              hidden md:flex
              items-center
              gap-8
              text-sm
              font-medium
              text-slate-500
              dark:text-zinc-400
            "
          >
            <Link
              href="#platform"
              className="hover:text-purple-600 transition"
            >
              Platform
            </Link>

            <Link
              href="#workflow"
              className="hover:text-purple-600 transition"
            >
              Workflow
            </Link>

            <Link
              href="#work"
              className="hover:text-purple-600 transition"
            >
              Work
            </Link>

            <Link
              href="#pricing"
              className="hover:text-purple-600 transition"
            >
              Pricing
            </Link>
          </div>


          {/* ACTIONS */}
          <div className="flex items-center gap-4">

            {!activeUser && (
              <Link
                href="/sign-in"
                className="
                  hidden sm:block
                  text-sm
                  font-medium
                  text-slate-600
                  hover:text-purple-600
                  transition
                  dark:text-zinc-300
                "
              >
                Sign in
              </Link>
            )}


            <Link
              href={activeUser ? "/admin" : "/sign-up"}
              className="
                rounded-full
                bg-purple-600
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                shadow-lg
                shadow-purple-600/20
                hover:bg-purple-700
                transition
              "
            >
              {activeUser ? "Dashboard" : "Get started"}
            </Link>

          </div>

        </nav>
      </div>
    </header>
  );
}
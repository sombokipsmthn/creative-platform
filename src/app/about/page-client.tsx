"use client";

import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/header";
import ThemeToggle from "@/components/ThemeToggle";
import { useCreator } from "@/context/CreatorContext";

export const metadata: Metadata = {
  title: "About KIPSMTHN | Creative Platform",
  description:
    "KIPSMTHN is a multi-tenant creative portfolio engine and private client delivery platform for photographers, filmmakers, and creative teams.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About KIPSMTHN | Creative Platform",
    description:
      "KIPSMTHN is a multi-tenant creative portfolio engine and private client delivery platform for photographers, filmmakers, and creative teams.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "KIPSMTHN About",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About KIPSMTHN | Creative Platform",
    description:
      "KIPSMTHN is a multi-tenant creative portfolio engine and private client delivery platform for photographers, filmmakers, and creative teams.",
  },
};

const resolveImage = (
  source?: string | null,
  fallbackUrl?: string
) => {
  if (!source) {
    return (
      fallbackUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"
    );
  }

  if (
    source.startsWith("http://") ||
    source.startsWith("https://")
  ) {
    return source;
  }

  return `https://lh3.googleusercontent.com/d/${source}`;
};

export default function AboutPage() {
  const { activeUser } = useCreator();

  const profile = activeUser?.profile;

  const bio =
    profile?.bio ||
    "KIPSMTHN is a multi-tenant creative portfolio engine and private client delivery platform.";

  const location =
    profile?.location || "Nairobi, Kenya";

  return (
    <div className="">
      <Header />

      {/* HERO */}
      <section className="">
        <div className="" />

        <p className="">
          {activeUser
            ? `ABOUT ${activeUser.name}`
            : "ABOUT KIPSMTHN PLATFORM"}
        </p>

        <h1 className="">
          {activeUser
            ? activeUser.name
            : "Multi-Creator Portfolio & Client Delivery Engine"}
        </h1>

        <p className="">
          {bio}
        </p>
      </section>

      {/* CREATOR PROFILE */}
      {!activeUser ? (
        <section className="">
          <div className="">
            <h2 className="">
              No Creator Logged In
            </h2>

            <p className="">
              Log in to your creator account to view your
              profile and portfolio information.
            </p>

            <Link
              href="/admin/login"
              className="Button Button--primary"
            >
              Creator Login →
            </Link>
          </div>
        </section>
      ) : (
        <section className="">
          <div className="">
            <div className="">
              <div className="">
                <span className="">
                  {activeUser.name} — {location}
                </span>
              </div>

              <h2 className="">
                About {activeUser.name}
              </h2>

              <p className="">
                {bio}
              </p>

              {profile?.website && (
                <div className="">
                  <Link
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="Button Button--primary"
                  >
                    Visit Website ↗
                  </Link>
                </div>
              )}
            </div>

            <div className="">
              <Image
                src={resolveImage(profile?.avatarUrl)}
                alt={activeUser.name}
                fill
                className=""
                unoptimized
              />
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="">
        <div className="">
          <p>
            © {new Date().getFullYear()}{" "}
            {activeUser?.handle || "KIPSMTHN"}. All rights reserved.
          </p>

          <div className="">
            <ThemeToggle />
            <span>{location}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

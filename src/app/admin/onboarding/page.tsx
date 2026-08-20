"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
} from "lucide-react";

type FormState = {
  name: string;
  handle: string;
  bio: string;
  website: string;
  location: string;
};

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [form, setForm] = useState<FormState>({
    name: "",
    handle: "",
    bio: "",
    website: "",
    location: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const displayName = user
    ? user.fullName ||
      [user.firstName || "", user.lastName || ""]
        .filter(Boolean)
        .join(" ")
    : "";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const suggestedHandle =
    displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");

  function updateField(
    field: keyof FormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      setError(
        "Please sign in before completing your creator profile."
      );
      return;
    }

    const name = (form.name || displayName).trim();

    const handle = (form.handle || suggestedHandle)
      .trim()
      .toLowerCase()
      .replace(/^@/, "")
      .replace(/[^a-z0-9_-]/g, "");

    if (!name) {
      setError("Please enter your display name.");
      return;
    }

    if (!handle) {
      setError("Please choose a creator handle.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        "/api/onboarding",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            handle,
            bio: form.bio.trim(),
            website: form.website.trim(),
            location: form.location.trim(),
            avatarUrl: user.imageUrl || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to save your creator profile."
        );
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#6D28D9]" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6D28D9] text-sm font-bold text-white">
            K
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">
            Sign in required
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Please sign in to continue setting up your
            creator profile.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/sign-in")
            }
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#6D28D9] px-5 text-sm font-medium text-white transition hover:bg-[#5B21B6]"
          >
            Go to sign in
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        {/* LEFT SIDE */}
        <section className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
          <div>
            {/* BRAND */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6D28D9] text-sm font-bold text-white">
                K
              </div>

              <span className="text-sm font-semibold tracking-tight">
                KIPSMTHN
              </span>
            </div>

            <div className="mt-16 max-w-xl">
              {/* EYEBROW */}
              <div className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-medium text-[#6D28D9]">
                Creator setup
              </div>

              {/* HEADING */}
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-gray-950 sm:text-5xl lg:text-6xl">
                Build your creator profile.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-gray-500">
                This is the foundation for your public
                portfolio and private creator workspace.
                We&apos;ll use these details across your
                profile, client experience, quotes,
                invoices, and workspace.
              </p>

              {/* BENEFITS */}
              <div className="mt-10 space-y-5">
                {[
                  {
                    title:
                      "Create your public identity",
                    description:
                      "Your name, handle, bio, and image will form the foundation of your creator profile.",
                  },
                  {
                    title:
                      "Prepare your client experience",
                    description:
                      "Your profile information will be available throughout the tools you use to work with clients.",
                  },
                  {
                    title:
                      "Build everything from one place",
                    description:
                      "You can continue adding your work, services, contact details, and other information after this step.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-50">
                      <Check className="h-4 w-4 text-[#6D28D9]" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-12 text-xs text-gray-400">
            You can change these details later from your
            creator workspace.
          </p>
        </section>

        {/* RIGHT SIDE */}
        <section className="w-full px-6 pb-8 sm:px-10 lg:w-140 lg:border-l lg:border-gray-100 lg:px-12 lg:py-12">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-8"
          >
            {/* FORM HEADER */}
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6D28D9]">
                Step 01
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Your creator profile
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Start with the basics. You&apos;ll be
                able to build out your full workspace
                next.
              </p>
            </div>

            {/* AVATAR */}
            <div className="mt-8 flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-purple-50">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt=""
                    fill
                    sizes="64px"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus className="h-5 w-5 text-[#6D28D9]" />
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">
                  Profile image
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your Clerk profile image will be used
                  automatically.
                </p>
              </div>
            </div>

            {/* NAME */}
            <div className="mt-8">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-800"
              >
                Display name
              </label>

              <input
                id="name"
                type="text"
                value={form.name || displayName}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Your name"
                autoComplete="name"
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* HANDLE */}
            <div className="mt-5">
              <label
                htmlFor="handle"
                className="text-sm font-medium text-gray-800"
              >
                Creator handle
              </label>

              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  @
                </span>

                <input
                  id="handle"
                  type="text"
                  value={form.handle || suggestedHandle}
                  onChange={(event) =>
                    updateField(
                      "handle",
                      event.target.value
                    )
                  }
                  placeholder="your-handle"
                  autoComplete="username"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Use letters, numbers, hyphens, or
                underscores.
              </p>
            </div>

            {/* BIO */}
            <div className="mt-5">
              <label
                htmlFor="bio"
                className="text-sm font-medium text-gray-800"
              >
                Bio
              </label>

              <textarea
                id="bio"
                value={form.bio}
                onChange={(event) =>
                  updateField(
                    "bio",
                    event.target.value
                  )
                }
                placeholder="Tell clients what you create..."
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* WEBSITE */}
            <div className="mt-5">
              <label
                htmlFor="website"
                className="text-sm font-medium text-gray-800"
              >
                Website
                <span className="ml-2 text-xs font-normal text-gray-400">
                  Optional
                </span>
              </label>

              <input
                id="website"
                type="url"
                value={form.website}
                onChange={(event) =>
                  updateField(
                    "website",
                    event.target.value
                  )
                }
                placeholder="https://yourwebsite.com"
                autoComplete="url"
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* LOCATION */}
            <div className="mt-5">
              <label
                htmlFor="location"
                className="text-sm font-medium text-gray-800"
              >
                Location
                <span className="ml-2 text-xs font-normal text-gray-400">
                  Optional
                </span>
              </label>

              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(event) =>
                  updateField(
                    "location",
                    event.target.value
                  )
                }
                placeholder="Nairobi, Kenya"
                autoComplete="address-level2"
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={saving}
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#6D28D9] px-5 text-sm font-semibold text-white transition hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating profile...
                </>
              ) : (
                <>
                  Continue to workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
              You can update these details later from
              your creator workspace.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
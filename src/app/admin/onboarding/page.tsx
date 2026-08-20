"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

type ProfileForm = {
  name: string;
  handle: string;
  bio: string;
  website: string;
  location: string;
};

type ServiceForm = {
  id?: string;
  name: string;
  description: string;
  category: string;
  defaultRate: string;
  currency: string;
};

type BusinessForm = {
  businessName: string;
  phone: string;
  kraPin: string;
  vatRegistered: boolean;
  vatNumber: string;
  currency: string;
  depositPercentage: string;
  whtRate: string;
};

type OnboardingData = {
  user: {
    id: string;
    name: string;
    handle: string;
    onboardingStatus: string;
    onboardingStep: number;
  } | null;

  profile: {
    id: string;
    bio: string | null;
    website: string | null;
    location: string | null;
    avatarUrl: string | null;
  } | null;

  services: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    defaultRate: number | null;
    currency: string;
    isActive: boolean;
  }>;

  business: {
    id: string;
    businessName: string | null;
    phone: string | null;
    kraPin: string | null;
    vatRegistered: boolean;
    vatNumber: string | null;
    currency: string;
    depositPercentage: number;
    whtRate: number;
  } | null;
};

const STEPS = [
  {
    number: 1,
    title: "Profile",
    description: "Your public creator identity",
  },
  {
    number: 2,
    title: "Services",
    description: "What you offer clients",
  },
  {
    number: 3,
    title: "Business",
    description: "Business and payment details",
  },
  {
    number: 4,
    title: "Finish",
    description: "Review your setup",
  },
] as const;

const emptyService: ServiceForm = {
  name: "",
  description: "",
  category: "",
  defaultRate: "",
  currency: "KES",
};

/**
 * Quick-add services.
 *
 * These are intentionally lightweight presets.
 * The creator can add one with a single click and
 * edit the details afterwards.
 */
const QUICK_ADD_SERVICES: Array<{
  name: string;
  category: string;
  description: string;
}> = [
  {
    name: "Photography",
    category: "Photography",
    description:
      "Professional photography services for brands, events, products, and people.",
  },
  {
    name: "Videography",
    category: "Video",
    description:
      "Professional video production for brands, events, campaigns, and stories.",
  },
  {
    name: "Video Editing",
    category: "Post-production",
    description:
      "Professional editing, colour, sound, and finishing for video content.",
  },
  {
    name: "Graphic Design",
    category: "Design",
    description:
      "Creative design services for campaigns, social content, presentations, and brands.",
  },
  {
    name: "Content Creation",
    category: "Content",
    description:
      "End-to-end visual content creation for brands and digital platforms.",
  },
  {
    name: "Brand Photography",
    category: "Photography",
    description:
      "Photography designed to communicate a brand's identity, products, and story.",
  },
  {
    name: "Event Coverage",
    category: "Events",
    description:
      "Photo and video coverage for events, launches, conferences, and experiences.",
  },
  {
    name: "Corporate Video",
    category: "Video",
    description:
      "Professional corporate films, interviews, profiles, and internal communications.",
  },
  {
    name: "Social Media Content",
    category: "Content",
    description:
      "Short-form visual content created for social media campaigns and ongoing publishing.",
  },
];

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [currentStep, setCurrentStep] =
    useState<Step>(1);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [profile, setProfile] =
    useState<ProfileForm>({
      name: "",
      handle: "",
      bio: "",
      website: "",
      location: "",
    });

  const [services, setServices] =
    useState<ServiceForm[]>([
      { ...emptyService },
    ]);

  const [business, setBusiness] =
    useState<BusinessForm>({
      businessName: "",
      phone: "",
      kraPin: "",
      vatRegistered: false,
      vatNumber: "",
      currency: "KES",
      depositPercentage: "50",
      whtRate: "0",
    });

  const displayName = useMemo(() => {
    if (!user) {
      return "";
    }

    return (
      user.fullName ||
      [user.firstName || "", user.lastName || ""]
        .filter(Boolean)
        .join(" ")
    );
  }, [user]);

  const email =
    user?.primaryEmailAddress?.emailAddress || "";

  const suggestedHandle = useMemo(() => {
    const source =
      displayName || email.split("@")[0];

    return source
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, [displayName, email]);

  /*
   * Load onboarding data.
   *
   * Important:
   * The effect only starts the async operation.
   * State updates happen inside the async callback,
   * which avoids the react-hooks/set-state-in-effect
   * lint error caused by synchronous setState calls
   * directly inside the effect body.
   */
  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    let cancelled = false;

    async function loadOnboarding() {
      try {
        const response = await fetch(
          "/api/onboarding",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load onboarding."
          );
        }

        if (cancelled) {
          return;
        }

        const onboarding =
          data as OnboardingData;

        if (onboarding.user) {
          setProfile({
            name:
              onboarding.user.name ||
              displayName,

            handle:
              onboarding.user.handle ||
              suggestedHandle,

            bio:
              onboarding.profile?.bio ||
              "",

            website:
              onboarding.profile?.website ||
              "",

            location:
              onboarding.profile?.location ||
              "",
          });

          if (
            onboarding.services &&
            onboarding.services.length > 0
          ) {
            setServices(
              onboarding.services.map(
                (service) => ({
                  id: service.id,
                  name: service.name,
                  description:
                    service.description ||
                    "",
                  category:
                    service.category ||
                    "",
                  defaultRate:
                    service.defaultRate !==
                    null
                      ? String(
                          service.defaultRate
                        )
                      : "",
                  currency:
                    service.currency ||
                    "KES",
                })
              )
            );
          }

          if (onboarding.business) {
            setBusiness({
              businessName:
                onboarding.business
                  .businessName || "",

              phone:
                onboarding.business.phone ||
                "",

              kraPin:
                onboarding.business.kraPin ||
                "",

              vatRegistered:
                onboarding.business
                  .vatRegistered,

              vatNumber:
                onboarding.business
                  .vatNumber || "",

              currency:
                onboarding.business.currency ||
                "KES",

              depositPercentage:
                String(
                  onboarding.business
                    .depositPercentage ?? 50
                ),

              whtRate:
                String(
                  onboarding.business
                    .whtRate ?? 0
                ),
            });
          }

          const step =
            onboarding.user.onboardingStep;

          if (
            onboarding.user.onboardingStatus ===
            "complete"
          ) {
            router.replace("/admin");
            return;
          }

          if (step >= 1 && step <= 4) {
            setCurrentStep(step as Step);
          }
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load onboarding."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOnboarding();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    user,
    displayName,
    suggestedHandle,
    router,
  ]);

  function updateProfile(
    field: keyof ProfileForm,
    value: string
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateService(
    index: number,
    field: keyof ServiceForm,
    value: string
  ) {
    setServices((current) =>
      current.map(
        (service, serviceIndex) =>
          serviceIndex === index
            ? {
                ...service,
                [field]: value,
              }
            : service
      )
    );
  }

  function addService() {
    setServices((current) => [
      ...current,
      { ...emptyService },
    ]);
  }

  function quickAddService(
    preset: (typeof QUICK_ADD_SERVICES)[number]
  ) {
    setServices((current) => {
      /*
       * If the only existing service is completely
       * empty, use that row instead of creating an
       * unnecessary second card.
       */
      if (
        current.length === 1 &&
        !current[0].name.trim()
      ) {
        return [
          {
            ...current[0],
            name: preset.name,
            description:
              preset.description,
            category: preset.category,
          },
        ];
      }

      return [
        ...current,
        {
          ...emptyService,
          name: preset.name,
          description:
            preset.description,
          category: preset.category,
        },
      ];
    });
  }

  function removeService(index: number) {
    setServices((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(
        (_, serviceIndex) =>
          serviceIndex !== index
      );
    });
  }

  function updateBusiness(
    field: keyof BusinessForm,
    value: string | boolean
  ) {
    setBusiness((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateProfile() {
    const name =
      (profile.name || displayName).trim();

    const handle =
      (profile.handle || suggestedHandle)
        .trim()
        .toLowerCase()
        .replace(/^@/, "")
        .replace(/[^a-z0-9_-]/g, "");

    if (!name) {
      setError(
        "Please enter your display name."
      );

      return false;
    }

    if (!handle) {
      setError(
        "Please choose a creator handle."
      );

      return false;
    }

    return true;
  }

  function validateServices() {
    const validServices =
      services.filter(
        (service) =>
          service.name.trim().length > 0
      );

    if (validServices.length === 0) {
      setError(
        "Please add at least one service before continuing."
      );

      return false;
    }

    return true;
  }

  async function saveProfile() {
    const name =
      (profile.name || displayName).trim();

    const handle =
      (profile.handle || suggestedHandle)
        .trim()
        .toLowerCase()
        .replace(/^@/, "")
        .replace(/[^a-z0-9_-]/g, "");

    const response = await fetch(
      "/api/onboarding",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          section: "profile",
          name,
          handle,
          bio: profile.bio.trim(),
          website:
            profile.website.trim(),
          location:
            profile.location.trim(),
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          "Unable to save your profile."
      );
    }
  }

  async function saveServices() {
    const validServices = services
      .filter(
        (service) =>
          service.name.trim().length > 0
      )
      .map((service) => ({
        id: service.id,
        name: service.name.trim(),
        description:
          service.description.trim(),
        category:
          service.category.trim(),
        defaultRate:
          service.defaultRate.trim(),
        currency:
          service.currency || "KES",
      }));

    const response = await fetch(
      "/api/onboarding",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          section: "services",
          services: validServices,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          "Unable to save your services."
      );
    }

    if (data.services) {
      setServices(
        data.services.map(
          (service: {
            id: string;
            name: string;
            description:
              | string
              | null;
            category:
              | string
              | null;
            defaultRate:
              | number
              | null;
            currency: string;
          }) => ({
            id: service.id,
            name: service.name,
            description:
              service.description || "",
            category:
              service.category || "",
            defaultRate:
              service.defaultRate !==
              null
                ? String(
                    service.defaultRate
                  )
                : "",
            currency:
              service.currency || "KES",
          })
        )
      );
    }
  }

  async function saveBusiness() {
    const response = await fetch(
      "/api/onboarding",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          section: "business",
          business: {
            businessName:
              business.businessName.trim(),

            phone:
              business.phone.trim(),

            kraPin:
              business.kraPin.trim(),

            vatRegistered:
              business.vatRegistered,

            vatNumber:
              business.vatNumber.trim(),

            currency:
              business.currency,

            depositPercentage:
              business.depositPercentage,

            whtRate:
              business.whtRate,
          },
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          "Unable to save your business details."
      );
    }
  }

  async function finishOnboarding() {
    const response = await fetch(
      "/api/onboarding",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          section: "finish",
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          "Unable to finish onboarding."
      );
    }

    router.replace("/admin");
    router.refresh();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (saving) {
      return;
    }

    if (currentStep === 1) {
      if (!validateProfile()) {
        return;
      }

      setSaving(true);

      try {
        await saveProfile();
        setCurrentStep(2);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to save your profile."
        );
      } finally {
        setSaving(false);
      }

      return;
    }

    if (currentStep === 2) {
      if (!validateServices()) {
        return;
      }

      setSaving(true);

      try {
        await saveServices();
        setCurrentStep(3);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to save your services."
        );
      } finally {
        setSaving(false);
      }

      return;
    }

    if (currentStep === 3) {
      setSaving(true);

      try {
        await saveBusiness();
        setCurrentStep(4);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to save your business details."
        );
      } finally {
        setSaving(false);
      }

      return;
    }

    setSaving(true);

    try {
      await finishOnboarding();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to finish onboarding."
      );
    } finally {
      setSaving(false);
    }
  }

  async function skipBusiness() {
    setError("");
    setSaving(true);

    try {
      const response = await fetch(
        "/api/onboarding",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            section: "business",
            skip: true,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to skip this step."
        );
      }

      setCurrentStep(4);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to skip this step."
      );
    } finally {
      setSaving(false);
    }
  }

  async function skipToFinish() {
    setError("");
    setSaving(true);

    try {
      await finishOnboarding();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to finish onboarding."
      );
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    setError("");

    if (currentStep > 1) {
      setCurrentStep(
        (currentStep - 1) as Step
      );
    }
  }

  if (!isLoaded || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-[#6D28D9]" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6D28D9] text-sm font-bold text-white">
            K
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">
            Sign in required
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Please sign in to continue
            setting up your creator
            workspace.
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

  const activeStep =
    STEPS[currentStep - 1];

  const validServiceCount =
    services.filter(
      (service) =>
        service.name.trim().length > 0
    ).length;

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-gray-900">
      <div className="mx-auto min-h-screen w-full max-w-7xl">
        {/* HEADER */}
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10 lg:px-12">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6D28D9] text-sm font-bold text-white">
                K
              </div>

              <span className="text-sm font-semibold tracking-tight">
                KIPSMTHN
              </span>
            </div>

            <p className="hidden text-sm text-gray-400 sm:block">
              Creator setup
            </p>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl lg:grid-cols-[300px_1fr]">
          {/* SIDEBAR */}
          <aside className="border-b border-gray-100 bg-white px-6 py-8 sm:px-10 lg:min-h-[calc(100vh-81px)] lg:border-b-0 lg:border-r lg:px-8 lg:py-12">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6D28D9]">
                Setup
              </p>

              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950">
                Build your workspace.
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Complete the essentials
                first, then add the business
                details when you&apos;re ready.
              </p>
            </div>

            <div className="mt-10 space-y-2">
              {STEPS.map((step) => {
                const isActive =
                  step.number ===
                  currentStep;

                const isComplete =
                  step.number <
                  currentStep;

                return (
                  <div
                    key={step.number}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${
                      isActive
                        ? "bg-purple-50"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
                        isComplete ||
                        isActive
                          ? "bg-[#6D28D9] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        step.number
                      )}
                    </div>

                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isActive ||
                          isComplete
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        {
                          step.description
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-700">
                Required to enter your
                dashboard
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <Check className="h-3.5 w-3.5 text-[#6D28D9]" />
                Profile
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Check className="h-3.5 w-3.5 text-[#6D28D9]" />
                At least one service
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <section className="px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
            <div className="mx-auto max-w-2xl">
              {/* TOP */}
              <div className="mb-8">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6D28D9]">
                  Step {currentStep} of{" "}
                  {STEPS.length}
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-gray-950">
                  {activeStep.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {
                    activeStep.description
                  }
                </p>
              </div>

              {/* PROGRESS */}
              <div className="mb-8 flex gap-2">
                {STEPS.map((step) => (
                  <div
                    key={step.number}
                    className={`h-1.5 flex-1 rounded-full ${
                      step.number <=
                      currentStep
                        ? "bg-[#6D28D9]"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-8"
              >
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-purple-50">
                        {user.imageUrl ? (
                          <Image
                            src={
                              user.imageUrl
                            }
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
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
                          Your Clerk profile
                          image will be used
                          automatically.
                        </p>
                      </div>
                    </div>

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
                        value={
                          profile.name ||
                          displayName
                        }
                        onChange={(event) =>
                          updateProfile(
                            "name",
                            event.target
                              .value
                          )
                        }
                        placeholder="Your name"
                        autoComplete="name"
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                      />
                    </div>

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
                          value={
                            profile.handle ||
                            suggestedHandle
                          }
                          onChange={(event) =>
                            updateProfile(
                              "handle",
                              event.target
                                .value
                            )
                          }
                          placeholder="your-handle"
                          autoComplete="username"
                          className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                        />
                      </div>

                      <p className="mt-2 text-xs text-gray-400">
                        Use letters, numbers,
                        hyphens, or
                        underscores.
                      </p>
                    </div>

                    <div className="mt-5">
                      <label
                        htmlFor="bio"
                        className="text-sm font-medium text-gray-800"
                      >
                        Bio
                      </label>

                      <textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(event) =>
                          updateProfile(
                            "bio",
                            event.target
                              .value
                          )
                        }
                        placeholder="Tell clients what you create..."
                        rows={4}
                        className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                      />
                    </div>

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
                        value={
                          profile.website
                        }
                        onChange={(event) =>
                          updateProfile(
                            "website",
                            event.target
                              .value
                          )
                        }
                        placeholder="https://yourwebsite.com"
                        autoComplete="url"
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                      />
                    </div>

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
                        value={
                          profile.location
                        }
                        onChange={(event) =>
                          updateProfile(
                            "location",
                            event.target
                              .value
                          )
                        }
                        placeholder="Nairobi, Kenya"
                        autoComplete="address-level2"
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                      />
                    </div>
                  </>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <>
                    <div className="rounded-2xl bg-purple-50 p-4">
                      <div className="flex gap-3">
                        <BriefcaseBusiness className="mt-0.5 h-5 w-5 shrink-0 text-[#6D28D9]" />

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Add the services you
                            sell
                          </p>

                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            Quickly add common
                            services below, then
                            edit their details
                            before continuing.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* QUICK ADD */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Quick add
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Add a service with
                            sensible defaults.
                          </p>
                        </div>

                        <span className="text-xs text-gray-400">
                          Edit details below
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {QUICK_ADD_SERVICES.map(
                          (preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() =>
                                quickAddService(
                                  preset
                                )
                              }
                              disabled={saving}
                              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 transition hover:border-[#6D28D9] hover:bg-purple-50 hover:text-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              {preset.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="mt-6 space-y-5">
                      {services.map(
                        (
                          service,
                          index
                        ) => (
                          <div
                            key={
                              service.id ||
                              `service-${index}`
                            }
                            className="rounded-2xl border border-gray-200 p-5"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-800">
                                Service{" "}
                                {index +
                                  1}
                              </p>

                              {services.length >
                                1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeService(
                                      index
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="mt-4">
                              <label className="text-sm font-medium text-gray-800">
                                Service name
                              </label>

                              <input
                                type="text"
                                value={
                                  service.name
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateService(
                                    index,
                                    "name",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Photography"
                                className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                              />
                            </div>

                            <div className="mt-4">
                              <label className="text-sm font-medium text-gray-800">
                                Description
                                <span className="ml-2 text-xs font-normal text-gray-400">
                                  Optional
                                </span>
                              </label>

                              <textarea
                                value={
                                  service.description
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateService(
                                    index,
                                    "description",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Describe what this service includes..."
                                rows={3}
                                className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                              />
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="text-sm font-medium text-gray-800">
                                  Category
                                  <span className="ml-2 text-xs font-normal text-gray-400">
                                    Optional
                                  </span>
                                </label>

                                <input
                                  type="text"
                                  value={
                                    service.category
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateService(
                                      index,
                                      "category",
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  placeholder="Photography"
                                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium text-gray-800">
                                  Default rate
                                  <span className="ml-2 text-xs font-normal text-gray-400">
                                    Optional
                                  </span>
                                </label>

                                <div className="mt-2 flex gap-2">
                                  <select
                                    value={
                                      service.currency
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateService(
                                        index,
                                        "currency",
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                    className="h-12 w-24 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#6D28D9]"
                                  >
                                    <option value="KES">
                                      KES
                                    </option>
                                    <option value="USD">
                                      USD
                                    </option>
                                    <option value="EUR">
                                      EUR
                                    </option>
                                  </select>

                                  <input
                                    type="number"
                                    min="0"
                                    value={
                                      service.defaultRate
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateService(
                                        index,
                                        "defaultRate",
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                    placeholder="25000"
                                    className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={addService}
                      className="mt-5 inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add another service
                    </button>
                  </>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="flex gap-3">
                        <BriefcaseBusiness className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Business details
                          </p>

                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            These details help
                            prepare your
                            quoting,
                            invoicing, and
                            payment
                            workflows.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-800">
                        Business name
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          Optional
                        </span>
                      </label>

                      <input
                        type="text"
                        value={
                          business.businessName
                        }
                        onChange={(event) =>
                          updateBusiness(
                            "businessName",
                            event.target
                              .value
                          )
                        }
                        placeholder="Your studio or business name"
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                      />
                    </div>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-gray-800">
                          Phone
                        </label>

                        <input
                          type="tel"
                          value={
                            business.phone
                          }
                          onChange={(
                            event
                          ) =>
                            updateBusiness(
                              "phone",
                              event.target
                                .value
                            )
                          }
                          placeholder="+254..."
                          className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">
                          KRA PIN
                        </label>

                        <input
                          type="text"
                          value={
                            business.kraPin
                          }
                          onChange={(
                            event
                          ) =>
                            updateBusiness(
                              "kraPin",
                              event.target.value.toUpperCase()
                            )
                          }
                          placeholder="A000000000X"
                          className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm uppercase outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                        />
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-gray-200 p-4">
                      <label className="flex cursor-pointer items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            VAT registered
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Enable if your
                            business is VAT
                            registered.
                          </p>
                        </div>

                        <input
                          type="checkbox"
                          checked={
                            business.vatRegistered
                          }
                          onChange={(
                            event
                          ) =>
                            updateBusiness(
                              "vatRegistered",
                              event.target
                                .checked
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-[#6D28D9] focus:ring-[#6D28D9]"
                        />
                      </label>

                      {business.vatRegistered && (
                        <div className="mt-4">
                          <label className="text-sm font-medium text-gray-800">
                            VAT number
                          </label>

                          <input
                            type="text"
                            value={
                              business.vatNumber
                            }
                            onChange={(
                              event
                            ) =>
                              updateBusiness(
                                "vatNumber",
                                event.target
                                  .value
                              )
                            }
                            placeholder="VAT number"
                            className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid gap-5 sm:grid-cols-3">
                      <div>
                        <label className="text-sm font-medium text-gray-800">
                          Currency
                        </label>

                        <select
                          value={
                            business.currency
                          }
                          onChange={(event) =>
                            updateBusiness(
                              "currency",
                              event.target
                                .value
                            )
                          }
                          className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#6D28D9]"
                        >
                          <option value="KES">
                            KES
                          </option>
                          <option value="USD">
                            USD
                          </option>
                          <option value="EUR">
                            EUR
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">
                          Deposit %
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            business.depositPercentage
                          }
                          onChange={(
                            event
                          ) =>
                            updateBusiness(
                              "depositPercentage",
                              event.target
                                .value
                            )
                          }
                          className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-purple-100"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">
                          WHT rate %
                        </label>

                        <select
                          value={
                            business.whtRate
                          }
                          onChange={(event) =>
                            updateBusiness(
                              "whtRate",
                              event.target
                                .value
                            )
                          }
                          className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#6D28D9]"
                        >
                          <option value="0">
                            0%
                          </option>
                          <option value="5">
                            5%
                          </option>
                          <option value="20">
                            20%
                          </option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={skipBusiness}
                      disabled={saving}
                      className="mt-6 text-sm font-medium text-gray-400 transition hover:text-gray-600 disabled:opacity-50"
                    >
                      Skip business details
                      for now
                    </button>
                  </>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <>
                    <div className="flex flex-col items-center py-8 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50">
                        <Check className="h-7 w-7 text-[#6D28D9]" />
                      </div>

                      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-gray-950">
                        You&apos;re ready to
                        go.
                      </h3>

                      <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                        Your creator profile
                        and services are
                        set up. You can
                        continue building
                        your workspace from
                        the dashboard.
                      </p>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
                          <UserRound className="h-4 w-4 text-[#6D28D9]" />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Profile
                          </p>

                          <p className="text-xs text-gray-400">
                            {profile.name ||
                              displayName}
                          </p>
                        </div>

                        <Check className="ml-auto h-4 w-4 text-[#6D28D9]" />
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
                          <BriefcaseBusiness className="h-4 w-4 text-[#6D28D9]" />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Services
                          </p>

                          <p className="text-xs text-gray-400">
                            {
                              validServiceCount
                            }{" "}
                            service
                            {validServiceCount ===
                            1
                              ? ""
                              : "s"}{" "}
                            added
                          </p>
                        </div>

                        <Check className="ml-auto h-4 w-4 text-[#6D28D9]" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        skipToFinish
                      }
                      disabled={saving}
                      className="mt-6 w-full text-sm font-medium text-gray-400 transition hover:text-gray-600 disabled:opacity-50"
                    >
                      Skip remaining setup
                    </button>
                  </>
                )}

                {/* ERROR */}
                {error && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    {error}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-6">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={goBack}
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[#6D28D9] px-5 text-sm font-semibold text-white transition hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : currentStep ===
                      4 ? (
                      <>
                        Enter dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
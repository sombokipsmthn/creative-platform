"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

type Step = 1 | 2 | 3 | 4;

interface Service {
  id?: string;
  name: string;
  description: string;
  category: string;
  defaultRate: number;
  currency: "KES" | "USD" | "EUR";
  rates?: Record<string, number>;
}

interface ProfileData {
  name: string;
  handle: string;
  bio: string;
  website: string;
  location: string;
  avatarUrl: string;
}

interface BusinessData {
  businessName: string;
  phone: string;
  kraPin: string;
  vatRegistered: boolean;
  vatNumber: string;
  currency: "KES" | "USD" | "EUR";
  depositPercentage: string;
  whtRate: string;
}

interface StepInfo {
  number: Step;
  title: string;
  description: string;
}

const STEPS: StepInfo[] = [
  { number: 1, title: "Profile", description: "Your public identity on the platform" },
  { number: 2, title: "Services", description: "What you offer to clients" },
  { number: 3, title: "Business", description: "Billing, tax, and payment details" },
  { number: 4, title: "Finish", description: "Review and enter the dashboard" },
];

const QUICK_ADD_SERVICES: [string, string, string][] = [
  ["Photography", "Photography", "Portrait, event, commercial photography"],
  ["Videography", "Videography", "Video production and editing"],
  ["Photo Editing", "Post-production", "Retouching, color grading, culling"],
  ["Drone", "Aerial", "Aerial photography and videography"],
];

export default function CreatorOnboardingModal({
  isOpen,
  onClose,
  onComplete,
  onDismiss,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onDismiss?: () => void;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    handle: "",
    bio: "",
    website: "",
    location: "",
    avatarUrl: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [services, setServices] = useState<Service[]>([{ name: "", description: "", category: "", defaultRate: 0, currency: "KES" }]);
  const [business, setBusiness] = useState<BusinessData>({
    businessName: "",
    phone: "",
    kraPin: "",
    vatRegistered: false,
    vatNumber: "",
    currency: "KES",
    depositPercentage: "50",
    whtRate: "5",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handleStatus, setHandleStatus] = useState<"checking" | "available" | "taken" | null>(null);
  const [suggestedHandle, setSuggestedHandle] = useState<string>("");

  useEffect(() => {
    if (!user?.name) return;
    const base = user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const suggestion = `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
    setSuggestedHandle(suggestion);
    setProfile((p) => ({ ...p, handle: suggestion, name: user.name }));
  }, [user]);

  useEffect(() => {
    if (!profile.handle) return;
    const timeout = setTimeout(async () => {
      setHandleStatus("checking");
      try {
        const res = await fetch(`/api/users/check-handle?handle=${encodeURIComponent(profile.handle)}`);
        if (res.ok) {
          const data = await res.json();
          setHandleStatus(data.available ? "available" : "taken");
        }
      } catch {
        setHandleStatus(null);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [profile.handle]);

  const updateProfile = (key: keyof ProfileData, value: string) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const updateService = (index: number, key: keyof Service, value: string | number) => {
    setServices((s) => s.map((svc, i) => (i === index ? { ...svc, [key]: value } : svc)));
  };

  const updateServiceRate = (index: number, key: string, value: number) => {
    setServices((s) => s.map((svc, i) => i === index ? { ...svc, rates: { ...svc.rates, [key]: value } } : svc));
  };

  const toggleServiceRate = (index: number, key: string) => {
    setServices((s) => s.map((svc, i) => {
      if (i !== index) return svc;
      const next = { ...svc, rates: { ...svc.rates } };
      if (next.rates[key] !== undefined) {
        delete next.rates[key];
      } else {
        next.rates[key] = 0;
      }
      return next;
    }));
  };

  const addService = () => {
    setServices((s) => [...s, { name: "", description: "", category: "", defaultRate: 0, currency: "KES" }]);
  };

  const removeService = (index: number) => {
    if (services.length <= 1) return;
    setServices((s) => s.filter((_, i) => i !== index));
  };

  const quickAddService = (name: string, category: string, description: string) => {
    setServices((s) => {
      if (s.some((svc) => svc.name === name)) return s;
      return [...s, { name, description, category, defaultRate: 0, currency: "KES" }];
    });
  };

  const updateBusiness = (key: keyof BusinessData, value: string | number | boolean) => {
    setBusiness((b) => ({ ...b, [key]: value }));
  };

  const chooseAvatar = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose a JPEG, PNG, or WebP image under 5 MB.");
      return;
    }
    setAvatarBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAvatarUrl(data.url);
      updateProfile("avatarUrl", data.url);
    } catch {
      setError("Failed to upload avatar. Try again.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const skipBusiness = () => {
    setBusiness({ businessName: "", phone: "", kraPin: "", vatRegistered: false, vatNumber: "", currency: "KES", depositPercentage: "50", whtRate: "5" });
    setCurrentStep(4);
  };

  const skipToFinish = () => {
    setCurrentStep(4);
  };

  const dismissOnboarding = async () => {
    try {
      await fetch("/api/onboarding/dismiss", { method: "POST" });
    } finally {
      onDismiss?.();
      onClose();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const responses = await Promise.all([
        fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: { name: profile.name.trim(), handle: profile.handle.trim() },
            profile: { bio: profile.bio, avatarUrl: avatarUrl || undefined, website: profile.website, location: profile.location },
            businessProfile: business,
          }),
        }),
        currentStep === 1 && fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "profile", name: profile.name.trim(), handle: profile.handle.trim(), bio: profile.bio, website: profile.website, location: profile.location, avatarUrl }),
        }),
        currentStep === 2 && fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "services", services: services.filter(s => s.name).map(s => ({ name: s.name, description: s.description, category: s.category, defaultRate: s.defaultRate, currency: s.currency })) }),
        }),
        currentStep === 3 && fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "business", business: { businessName: business.businessName, phone: business.phone, kraPin: business.kraPin, vatRegistered: business.vatRegistered, vatNumber: business.vatNumber, currency: business.currency, depositPercentage: business.depositPercentage, whtRate: business.whtRate } }),
        }),
      ].filter(Boolean));
      if (responses.some((response) => response && !response.ok)) throw new Error("Unable to save onboarding");
      if (currentStep < 4) setCurrentStep((s) => (s + 1) as Step);
      else { onComplete?.(); onClose(); }
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-[99] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in required</h1>
          <p className="mt-3 text-sm text-gray-500">Please sign in to continue setting up your creator workspace.</p>
          <button type="button" onClick={() => router.push("/sign-in")} className="mt-6 h-11 rounded-xl bg-primary px-5 text-sm font-medium text-white">Go to sign in</button>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="min-h-screen bg-[#FAFAFA] text-gray-900">
          <div className="mx-auto min-h-screen w-full max-w-7xl">
            <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-12">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">K</div>
                  <span className="text-sm font-semibold">KIPSMTHN</span>
                </div>
                <span className="hidden text-sm text-gray-400 sm:block">Creator setup</span>
              </div>
            </header>

            <div className="grid lg:grid-cols-[300px_1fr]">
              <aside className="border-b border-gray-100 bg-white px-6 py-8 lg:min-h-[calc(100vh-81px)] lg:border-b-0 lg:border-r lg:px-8 lg:py-12">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Setup</p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight">Build your workspace.</h1>
                <p className="mt-3 text-sm leading-6 text-gray-500">Complete the essentials first, then add the business details when you&apos;re ready.</p>
                <div className="mt-10 space-y-2">
                  {STEPS.map((step) => (
                    <div key={step.number} className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${step.number === currentStep ? "bg-primary/10" : ""}`}>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${step.number <= currentStep ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                        {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${step.number <= currentStep ? "text-gray-900" : "text-gray-400"}`}>{step.title}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <section className="px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
                <div className="mx-auto max-w-2xl">
                  <div className="mb-8">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Step {currentStep} of {STEPS.length}</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight">{STEPS[currentStep - 1].title}</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{STEPS[currentStep - 1].description}</p>
                  </div>
                  <div className="mb-8 flex gap-2">
                    {STEPS.map((step) => (
                      <div key={step.number} className={`h-1.5 flex-1 rounded-full ${step.number <= currentStep ? "bg-primary" : "bg-gray-200"}`} />
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    {currentStep === 1 && (
                      <div>
                        <div className="flex items-center gap-4">
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-primary/10" aria-label="Upload profile photo">
                            {avatarUrl ? <Image src={avatarUrl} alt="Your profile" fill unoptimized className="object-cover" /> : <ImagePlus className="mx-auto h-6 w-6 text-primary" />}
                            <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-[9px] font-medium text-white opacity-0 transition group-hover:opacity-100">Change photo</span>
                          </button>
                          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void chooseAvatar(file); event.target.value = ""; }} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">Profile image</p>
                            <p className="mt-1 text-xs leading-5 text-gray-500">Upload your own photo. It is automatically cropped square and saved to your creator profile.</p>
                            <div className="mt-2 flex gap-2">
                              {avatarUrl && <button type="button" onClick={() => setAvatarUrl(null)} className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700"><X className="h-3 w-3" />Remove</button>}
                              {avatarBusy && <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Loader2 className="h-3 w-3 animate-spin" />Editing...</span>}
                            </div>
                          </div>
                        </div>

                        <div className="mt-8"><label htmlFor="name" className="text-sm font-medium">Display name</label><Input id="name" type="text" value={profile.name} onChange={(e) => updateProfile("name", e.target.value)} placeholder="Your name" className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20" /></div>

                        <div className="mt-5"><label htmlFor="handle" className="text-sm font-medium">Username</label><div className="relative mt-2"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">@</span><Input id="handle" type="text" value={profile.handle} onChange={(e) => updateProfile("handle", e.target.value)} placeholder={suggestedHandle || "your-username"} autoComplete="username" className={`h-12 w-full rounded-xl border bg-white pl-8 pr-28 text-sm outline-none focus:ring-4 focus:ring-primary/20 ${handleStatus === "taken" ? "border-red-300 focus:border-red-400" : handleStatus === "available" ? "border-green-300 focus:border-green-400" : "border-gray-200 focus:border-primary"}`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium">{handleStatus === "checking" && "Checking..."}{handleStatus === "available" && <span className="text-green-600">Available</span>}{handleStatus === "taken" && <span className="text-red-500">Taken</span>}</span></div><p className="mt-2 text-xs text-gray-400">Choose your own username. Only letters, numbers, hyphens, and underscores are allowed.</p></div>

                        <div className="mt-5"><label htmlFor="bio" className="text-sm font-medium">Bio</label><Textarea id="bio" value={profile.bio} onChange={(e) => updateProfile("bio", e.target.value)} placeholder="Tell clients what you create..." rows={4} className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20" /></div>
                        <div className="mt-5"><label htmlFor="website" className="text-sm font-medium">Website <span className="text-xs font-normal text-gray-400">Optional</span></label><Input id="website" type="url" value={profile.website} onChange={(e) => updateProfile("website", e.target.value)} placeholder="https://yourwebsite.com" className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20" /></div>
                        <div className="mt-5"><label htmlFor="location" className="text-sm font-medium">Location <span className="text-xs font-normal text-gray-400">Optional</span></label><Input id="location" type="text" value={profile.location} onChange={(e) => updateProfile("location", e.target.value)} placeholder="Nairobi, Kenya" className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20" /></div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div>
                        <div className="rounded-2xl bg-primary/10 p-4">
                          <div className="flex gap-3">
                            <BriefcaseBusiness className="h-5 w-5 shrink-0 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Add the services you sell</p>
                              <p className="mt-1 text-xs leading-5 text-gray-500">Quickly add common services, then edit their details.</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6">
                          <p className="text-sm font-medium">Quick add</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {QUICK_ADD_SERVICES.map(([name, category, description]) => (
                              <button key={name} type="button" disabled={saving} onClick={() => quickAddService(name, category, description)} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium ${services.some(s => s.name === name) ? "border-primary bg-primary text-white" : "border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary"}`}>
                                <Plus className="h-3.5 w-3.5" />{name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-6 space-y-5">
                          {services.map((service, index) => (
                            <div key={service.id || `service-${index}`} className="rounded-2xl border border-gray-200 p-5">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Service {index + 1}</p>
                                {services.length > 1 && (
                                  <button type="button" onClick={() => removeService(index)} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800">
                                    <Trash2 className="h-3.5 w-3.5" />Remove
                                  </button>
                                )}
                              </div>
                              <label className="mt-4 block text-sm font-medium">Service name
                                <Input value={service.name} onChange={(e) => updateService(index, "name", e.target.value)} placeholder="Photography" className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-primary" />
                              </label>
                              <label className="mt-4 block text-sm font-medium">Description <span className="text-xs font-normal text-gray-400">Optional</span>
                                <Textarea value={service.description} onChange={(e) => updateService(index, "description", e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                              </label>
                              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <label className="text-sm font-medium">Category
                                  <Input value={service.category} onChange={(e) => updateService(index, "category", e.target.value)} placeholder="Photography" className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none" />
                                </label>
                                <label className="text-sm font-medium">Default rate
                                  <Select value={service.currency} onValueChange={(value) => updateService(index, "currency", value)}>
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="KES">KES</SelectItem>
                                      <SelectItem value="USD">USD</SelectItem>
                                      <SelectItem value="EUR">EUR</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input type="number" min="0" value={service.defaultRate} onChange={(e) => updateService(index, "defaultRate", e.target.value)} placeholder="25000" className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 px-4 text-sm" />
                                </label>
                              </div>
                              <div className="mt-4">
                                <p className="text-sm font-medium">Rate options</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {(["fullDay", "halfDay", "hourly"] as const).map((key) => (
                                    <div key={key} className="flex items-center gap-2">
                                      <button type="button" onClick={() => toggleServiceRate(index, key)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${service.rates?.[key] !== undefined ? "border-primary bg-primary text-white" : "border-gray-200 bg-white text-gray-700"}`}>
                                        {key === "fullDay" ? "Full Day" : key === "halfDay" ? "Half Day" : "Hourly"}
                                      </button>
                                      {service.rates?.[key] !== undefined && (
                                        <Input type="number" min="0" value={service.rates[key] || ""} onChange={(e) => updateServiceRate(index, key, Number(e.target.value))} placeholder="Amount" className="h-9 w-24 rounded-lg border border-gray-200 px-2 text-sm" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={addService} className="mt-5 inline-flex h-11 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium">
                          <Plus className="mr-2 h-4 w-4" />Add another service
                        </button>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div>
                        <div className="rounded-2xl bg-gray-50 p-4">
                          <p className="text-sm font-medium">Business details</p>
                          <p className="mt-1 text-xs leading-5 text-gray-500">These details help prepare your quoting, invoicing, and payment workflows.</p>
                        </div>
                        <label className="mt-6 block text-sm font-medium">Business name <span className="text-xs font-normal text-gray-400">Optional</span>
                          <Input value={business.businessName} onChange={(e) => updateBusiness("businessName", e.target.value)} placeholder="Your studio or business name" className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm" />
                        </label>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                          <label className="text-sm font-medium">Phone
                            <Input value={business.phone} onChange={(e) => updateBusiness("phone", e.target.value)} placeholder="+254..." className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm" />
                          </label>
                          <label className="text-sm font-medium">KRA PIN
                            <Input value={business.kraPin} onChange={(e) => updateBusiness("kraPin", e.target.value.toUpperCase())} placeholder="A000000000X" className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm uppercase" />
                          </label>
                        </div>
                        <div className="mt-5 rounded-2xl border border-gray-200 p-4">
                          <label className="flex cursor-pointer items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">VAT registered</p>
                              <p className="mt-1 text-xs text-gray-400">Enable if your business is VAT registered.</p>
                            </div>
                            <input type="checkbox" checked={business.vatRegistered} onChange={(e) => updateBusiness("vatRegistered", e.target.checked)} className="h-4 w-4" />
                          </label>
                          {business.vatRegistered && (
                            <label className="mt-4 block text-sm font-medium">VAT number
                              <Input value={business.vatNumber} onChange={(e) => updateBusiness("vatNumber", e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm" />
                            </label>
                          )}
                        </div>
                        <div className="mt-5 grid gap-5 sm:grid-cols-3">
                          <label className="text-sm font-medium">Currency
                            <Select value={business.currency} onValueChange={(value) => updateBusiness("currency", value)}>
                              <SelectTrigger className="mt-2 w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="KES">KES</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                              </SelectContent>
                            </Select>
                          </label>
                          <label className="text-sm font-medium">Deposit %
                            <Input type="number" min="0" max="100" value={business.depositPercentage} onChange={(e) => updateBusiness("depositPercentage", Number(e.target.value))} className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm" />
                          </label>
                          <label className="text-sm font-medium">WHT rate
                            <Select value={String(business.whtRate)} onValueChange={(value) => updateBusiness("whtRate", Number(value))}>
                              <SelectTrigger className="mt-2 w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0%</SelectItem>
                                <SelectItem value="5">5%</SelectItem>
                                <SelectItem value="20">20%</SelectItem>
                              </SelectContent>
                            </Select>
                          </label>
                        </div>
                        <button type="button" onClick={skipBusiness} disabled={saving} className="mt-6 text-sm font-medium text-gray-400 hover:text-gray-600">
                          Skip business details for now
                        </button>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div>
                        <div className="flex flex-col items-center py-8 text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <Check className="h-7 w-7 text-primary" />
                          </div>
                          <h3 className="mt-6 text-2xl font-semibold">You&apos;re ready to go.</h3>
                          <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">Your creator profile and services are set up. Continue building your workspace from the dashboard.</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4">
                            <UserRound className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Profile</p>
                              <p className="text-xs text-gray-400">@{profile.handle || suggestedHandle}</p>
                            </div>
                            <Check className="ml-auto h-4 w-4 text-primary" />
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4">
                            <BriefcaseBusiness className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Services</p>
                              <p className="text-xs text-gray-400">{services.filter(s => s.name).length} service{services.filter(s => s.name).length === 1 ? "" : "s"} added</p>
                            </div>
                            <Check className="ml-auto h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <button type="button" onClick={skipToFinish} disabled={saving} className="mt-6 w-full text-sm font-medium text-gray-400 hover:text-gray-600">
                          Skip remaining setup
                        </button>
                      </div>
                    )}

                    {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</div>}
                    <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-6">
                      <div>{currentStep > 1 && <button type="button" onClick={() => { setError(null); setCurrentStep((currentStep - 1) as Step); }} disabled={saving} className="inline-flex h-11 items-center rounded-xl px-4 text-sm font-medium text-gray-600"><ArrowLeft className="mr-2 h-4 w-4" />Back</button>}</div>
                      <div className="flex items-center gap-3">
                        {currentStep < 4 && (
                          <button type="button" onClick={dismissOnboarding} disabled={saving} className="inline-flex h-11 items-center rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            Skip for now
                          </button>
                        )}
                        <button type="submit" disabled={saving || avatarBusy} className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white disabled:opacity-60">
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...
                            </>
                          ) : currentStep === 4 ? (
                            <>
                              Enter dashboard<ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Continue<ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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
  rates?: { fullDay?: string; halfDay?: string; hourly?: string };
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
  user: { id: string; name: string; handle: string | null; onboardingStatus: string; onboardingStep: number } | null;
  profile: { id: string; bio: string | null; website: string | null; location: string | null; avatarUrl: string | null } | null;
  services: Array<{ id: string; name: string; description: string | null; category: string | null; defaultRate: number | null; currency: string; isActive: boolean }>;
  business: { id: string; businessName: string | null; phone: string | null; kraPin: string | null; vatRegistered: boolean; vatNumber: string | null; currency: string; depositPercentage: number; whtRate: number } | null;
};

const STEPS = [
  { number: 1, title: "Profile", description: "Your public creator identity" },
  { number: 2, title: "Services", description: "What you offer clients" },
  { number: 3, title: "Business", description: "Business and payment details" },
  { number: 4, title: "Finish", description: "Review your setup" },
] as const;

const QUICK_ADD_SERVICES = [
  ["Photography", "Photography", "Professional photography services for brands, events, products, and people."],
  ["Videography", "Video", "Professional video production for brands, events, campaigns, and stories."],
  ["Video Editing", "Post-production", "Professional editing, colour, sound, and finishing for video content."],
  ["Graphic Design", "Design", "Creative design services for campaigns, social content, presentations, and brands."],
  ["Content Creation", "Content", "End-to-end visual content creation for brands and digital platforms."],
  ["Brand Photography", "Photography", "Photography designed to communicate a brand's identity, products, and story."],
  ["Event Coverage", "Events", "Photo and video coverage for events, launches, conferences, and experiences."],
  ["Corporate Video", "Video", "Professional corporate films, interviews, profiles, and internal communications."],
  ["Social Media Content", "Content", "Short-form visual content created for social media campaigns and ongoing publishing."],
] as const;

const emptyService: ServiceForm = { name: "", description: "", category: "", defaultRate: "", currency: "KES", rates: {} };

function normaliseHandle(value: string) {
  return value.toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_-]/g, "").slice(0, 40);
}

async function makeAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Please choose an image smaller than 8MB.");

  const source = await createImageBitmap(file);
  const size = Math.min(source.width, source.height);
  const sx = (source.width - size) / 2;
  const sy = (source.height - size) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to edit the selected image.");
  context.drawImage(source, sx, sy, size, size, 0, 0, 640, 640);
  source.close();

  return canvas.toDataURL("image/jpeg", 0.82);
}

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; firstName: string; lastName: string; primaryEmailAddress: { emailAddress: string } } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function getUser() {
      const { data: session } = await authClient.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          firstName: session.user.name || "",
          lastName: "",
          primaryEmailAddress: { emailAddress: session.user.email },
        });
      }
      setIsLoaded(true);
    }
    getUser();
  }, []);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [profile, setProfile] = useState<ProfileForm>({ name: "", handle: "", bio: "", website: "", location: "" });
  const [services, setServices] = useState<ServiceForm[]>([{ ...emptyService }]);
  const [addedPresets, setAddedPresets] = useState<string[]>([]);
  const [business, setBusiness] = useState<BusinessForm>({ businessName: "", phone: "", kraPin: "", vatRegistered: false, vatNumber: "", currency: "KES", depositPercentage: "50", whtRate: "0" });

  const displayName = useMemo(() => {
    if (!user) return "";
    return [user.firstName || "", user.lastName || ""].filter(Boolean).join(" ");
  }, [user]);

  const suggestedHandle = useMemo(() => {
    const source = displayName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "creator";
    return normaliseHandle(source.replace(/\s+/g, "-"));
  }, [displayName, user]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/onboarding", { cache: "no-store" });
        const data = (await response.json()) as OnboardingData & { error?: string };
        if (!response.ok) throw new Error(data.error || "Unable to load onboarding.");
        if (cancelled) return;

        if (data.user) {
          setProfile({
            name: data.user.name || displayName,
            handle: data.user.handle || "",
            bio: data.profile?.bio || "",
            website: data.profile?.website || "",
            location: data.profile?.location || "",
          });
          setAvatarUrl(data.profile?.avatarUrl || null);
          if (data.services.length) {
            setServices(data.services.map((service) => ({
              id: service.id,
              name: service.name,
              description: service.description || "",
              category: service.category || "",
              defaultRate: service.defaultRate === null ? "" : String(service.defaultRate),
              currency: service.currency || "KES",
            })));
          }
          if (data.business) {
            setBusiness({
              businessName: data.business.businessName || "",
              phone: data.business.phone || "",
              kraPin: data.business.kraPin || "",
              vatRegistered: data.business.vatRegistered,
              vatNumber: data.business.vatNumber || "",
              currency: data.business.currency || "KES",
              depositPercentage: String(data.business.depositPercentage ?? 50),
              whtRate: String(data.business.whtRate ?? 0),
            });
          }
          if (data.user.onboardingStatus === "complete") {
            router.replace("/admin");
            return;
          }
          if (data.user.onboardingStep >= 1 && data.user.onboardingStep <= 4) setCurrentStep(data.user.onboardingStep as Step);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load onboarding.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [displayName, isLoaded, router, user]);

  useEffect(() => {
    const handle = normaliseHandle(profile.handle);
    if (!handle) {
      const reset = window.setTimeout(() => setHandleStatus("idle"), 0);
      return () => window.clearTimeout(reset);
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setHandleStatus("checking");
      try {
        const response = await fetch(`/api/onboarding?handle=${encodeURIComponent(handle)}`, { cache: "no-store" });
        const data = (await response.json()) as { available?: boolean };
        if (!cancelled) setHandleStatus(data.available ? "available" : "taken");
      } catch {
        if (!cancelled) setHandleStatus("idle");
      }
    }, 350);

    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [profile.handle]);

  function updateProfile(field: keyof ProfileForm, value: string) {
    setProfile((current) => ({ ...current, [field]: field === "handle" ? normaliseHandle(value) : value }));
  }

  async function chooseAvatar(file: File) {
    setError("");
    setAvatarBusy(true);
    try {
      setAvatarUrl(await makeAvatarDataUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to edit that image.");
    } finally {
      setAvatarBusy(false);
    }
  }

  function updateService(index: number, field: keyof ServiceForm, value: string) {
    setServices((current) => current.map((service, i) => i === index ? { ...service, [field]: value } : service));
  }

  function toggleServiceRate(index: number, key: "fullDay" | "halfDay" | "hourly") {
    setServices((current) => current.map((service, i) => i === index ? {
      ...service,
      rates: { ...(service.rates || {}), [key]: service.rates?.[key] === undefined ? "" : undefined },
    } : service));
  }

  function updateServiceRate(index: number, key: "fullDay" | "halfDay" | "hourly", value: string) {
    setServices((current) => current.map((service, i) => i === index ? { ...service, rates: { ...(service.rates || {}), [key]: value } } : service));
  }

  function addService() { setServices((current) => [...current, { ...emptyService }]); }

  function removeService(index: number) {
    setServices((current) => current.length === 1 ? current : current.filter((_, i) => i !== index));
  }

  function quickAddService(name: string, category: string, description: string) {
    setAddedPresets((current) => Array.from(new Set([...current, name])));
    setServices((current) => {
      const next = { ...emptyService, name, category, description };
      if (current.length === 1 && !current[0].name.trim()) return [next];
      return [...current, next];
    });
  }

  function updateBusiness(field: keyof BusinessForm, value: string | boolean) {
    setBusiness((current) => ({ ...current, [field]: value }));
  }

  function validateProfile() {
    const handle = normaliseHandle(profile.handle);
    if (!profile.name.trim()) { setError("Please enter your display name."); return false; }
    if (!handle) { setError("Please choose a username."); return false; }
    if (handleStatus !== "available") { setError(handleStatus === "taken" ? "That username is already taken." : "Please wait for the username availability check to finish."); return false; }
    return true;
  }

  function validateServices() {
    if (!services.some((service) => service.name.trim())) { setError("Please add at least one service before continuing."); return false; }
    return true;
  }

  async function post(body: object) {
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "Unable to save your changes.");
    return data;
  }

  async function saveProfile() {
    await post({
      section: "profile",
      name: profile.name.trim(),
      handle: normaliseHandle(profile.handle),
      bio: profile.bio.trim(),
      website: profile.website.trim(),
      location: profile.location.trim(),
      avatarUrl,
    });
  }

  async function saveServices() {
    const validServices = services.filter((service) => service.name.trim()).map((service) => ({
      id: service.id,
      name: service.name.trim(),
      description: service.description.trim(),
      category: service.category.trim(),
      defaultRate: service.defaultRate.trim(),
      currency: service.currency || "KES",
    }));
    const data = await post({ section: "services", services: validServices });
    if (Array.isArray(data.services)) setServices(data.services.map((service: { id: string; name: string; description: string | null; category: string | null; defaultRate: number | null; currency: string }) => ({
      id: service.id,
      name: service.name,
      description: service.description || "",
      category: service.category || "",
      defaultRate: service.defaultRate === null ? "" : String(service.defaultRate),
      currency: service.currency || "KES",
    })));
  }

  async function saveBusiness(skip = false) {
    await post(skip ? { section: "business", skip: true } : {
      section: "business",
      business: {
        businessName: business.businessName.trim(),
        phone: business.phone.trim(),
        kraPin: business.kraPin.trim(),
        vatRegistered: business.vatRegistered,
        vatNumber: business.vatNumber.trim(),
        currency: business.currency,
        depositPercentage: business.depositPercentage,
        whtRate: business.whtRate,
      },
    });
  }

  async function finishOnboarding() {
    await post({ section: "finish" });
    router.replace("/admin");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");

    setSaving(true);
    try {
      if (currentStep === 1) { if (!validateProfile()) return; await saveProfile(); setCurrentStep(2); }
      else if (currentStep === 2) { if (!validateServices()) return; await saveServices(); setCurrentStep(3); }
      else if (currentStep === 3) { await saveBusiness(); setCurrentStep(4); }
      else await finishOnboarding();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your changes.");
    } finally {
      setSaving(false);
    }
  }

  async function skipBusiness() {
    setError("");
    setSaving(true);
    try { await saveBusiness(true); setCurrentStep(4); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to skip this step."); }
    finally { setSaving(false); }
  }

  async function skipToFinish() {
    setError("");
    setSaving(true);
    try { await finishOnboarding(); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to finish onboarding."); }
    finally { setSaving(false); }
  }

  if (!isLoaded || loading) return <main className="ui-page ui-page-padded"><div className="ui-shell"><div className="admin-empty-state" role="status"><Loader2 aria-hidden="true" /><p>Loading onboarding…</p></div></div></main>;

  if (!user) return <main className="ui-page ui-page-padded"><div className="ui-shell max-w-lg"><div className="ui-card admin-empty-state" role="alert"><h1>Sign in required</h1><p>Please sign in to continue setting up your creator workspace.</p><button type="button" onClick={() => router.push("/sign-in")} className="ui-button ui-button-primary">Go to sign in</button></div></div></main>;

  const activeStep = STEPS[currentStep - 1];
  const validServiceCount = services.filter((service) => service.name.trim()).length;

  return (
    <main className="ui-page ui-page-padded">
      <div className="ui-shell">
        <header className="">
          <div className="">
            <div className=""><div className="">K</div><span className="">KIPSMTHN</span></div>
            <span className="hidden">Creator setup</span>
          </div>
        </header>

        <div className="">
          <aside className="">
            <p className="">Setup</p>
            <h1 className="">Build your workspace.</h1>
            <p className="">Complete the essentials first, then add the business details when you&apos;re ready.</p>
            <div className="">
              {STEPS.map((step) => <div key={step.number} className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${step.number === currentStep ? "bg-purple-50" : ""}`}><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${step.number <= currentStep ? "bg-[#6D28D9] text-white" : "bg-gray-100 text-gray-400"}`}>{step.number < currentStep ? <Check className="" /> : step.number}</div><div><p className={`text-sm font-medium ${step.number <= currentStep ? "text-gray-900" : "text-gray-400"}`}>{step.title}</p><p className="">{step.description}</p></div></div>)}
            </div>
          </aside>

          <section className="">
            <div className="">
              <div className=""><p className="">Step {currentStep} of {STEPS.length}</p><h2 className="">{activeStep.title}</h2><p className="">{activeStep.description}</p></div>
              <div className="">{STEPS.map((step) => <div key={step.number} className={`h-1.5 flex-1 rounded-full ${step.number <= currentStep ? "bg-[#6D28D9]" : "bg-gray-200"}`} />)}</div>

              <form onSubmit={handleSubmit} className="">
                {currentStep === 1 && <>
                  <div className="">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="" aria-label="Upload profile photo">
                      {avatarUrl ? <Image src={avatarUrl} alt="Your profile" fill unoptimized className="" /> : <ImagePlus className="" />}
                      <span className="">Change photo</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void chooseAvatar(file); event.target.value = ""; }} />
                    <div className=""><p className="">Profile image</p><p className="">Upload your own photo. It is automatically cropped square and saved to your creator profile.</p><div className="">{avatarUrl && <button type="button" onClick={() => setAvatarUrl(null)} className=""><X className="" />Remove</button>}{avatarBusy && <span className=""><Loader2 className="" />Editing...</span>}</div></div>
                  </div>

                  <div className=""><label htmlFor="name" className="">Display name</label><input id="name" type="text" value={profile.name} onChange={(e) => updateProfile("name", e.target.value)} placeholder="Your name" className="" /></div>

                  <div className=""><label htmlFor="handle" className="">Username</label><div className=""><span className="">@</span><input id="handle" type="text" value={profile.handle} onChange={(e) => updateProfile("handle", e.target.value)} placeholder={suggestedHandle || "your-username"} autoComplete="username" className={`h-12 w-full rounded-xl border bg-white pl-8 pr-28 text-sm outline-none focus:ring-4 focus:ring-purple-100 ${handleStatus === "taken" ? "border-red-300 focus:border-red-400" : handleStatus === "available" ? "border-green-300 focus:border-green-400" : "border-gray-200 focus:border-[#6D28D9]"}`} /><span className="">{handleStatus === "checking" && "Checking..."}{handleStatus === "available" && <span className="">Available</span>}{handleStatus === "taken" && <span className="">Taken</span>}</span></div><p className="">Choose your own username. Only letters, numbers, hyphens, and underscores are allowed.</p></div>

                  <div className=""><label htmlFor="bio" className="">Bio</label><textarea id="bio" value={profile.bio} onChange={(e) => updateProfile("bio", e.target.value)} placeholder="Tell clients what you create..." rows={4} className="" /></div>
                  <div className=""><label htmlFor="website" className="">Website <span className="">Optional</span></label><input id="website" type="url" value={profile.website} onChange={(e) => updateProfile("website", e.target.value)} placeholder="https://yourwebsite.com" className="" /></div>
                  <div className=""><label htmlFor="location" className="">Location <span className="">Optional</span></label><input id="location" type="text" value={profile.location} onChange={(e) => updateProfile("location", e.target.value)} placeholder="Nairobi, Kenya" className="" /></div>
                </>}

                {currentStep === 2 && <>
                  <div className=""><div className=""><BriefcaseBusiness className="" /><div><p className="">Add the services you sell</p><p className="">Quickly add common services, then edit their details.</p></div></div></div>
                  <div className=""><p className="">Quick add</p><div className="">{QUICK_ADD_SERVICES.map(([name, category, description]) => <button key={name} type="button" disabled={saving} onClick={() => quickAddService(name, category, description)} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium ${addedPresets.includes(name) ? "border-[#6D28D9] bg-[#6D28D9] text-white" : "border-gray-200 bg-white text-gray-700 hover:border-[#6D28D9] hover:text-[#6D28D9]"}`}><Plus className="" />{name}</button>)}</div></div>
                  <div className="">{services.map((service, index) => <div key={service.id || `service-${index}`} className=""><div className=""><p className="">Service {index + 1}</p>{services.length > 1 && <button type="button" onClick={() => removeService(index)} className=""><Trash2 className="" />Remove</button>}</div><label className="block">Service name<input value={service.name} onChange={(e) => updateService(index, "name", e.target.value)} placeholder="Photography" className="" /></label><label className="block">Description <span className="">Optional</span><textarea value={service.description} onChange={(e) => updateService(index, "description", e.target.value)} rows={3} className="" /></label><div className=""><label className="">Category<input value={service.category} onChange={(e) => updateService(index, "category", e.target.value)} placeholder="Photography" className="" /></label><label className="">Default rate<div className=""><select value={service.currency} onChange={(e) => updateService(index, "currency", e.target.value)} className=""><option>KES</option><option>USD</option><option>EUR</option></select><input type="number" min="0" value={service.defaultRate} onChange={(e) => updateService(index, "defaultRate", e.target.value)} placeholder="25000" className="" /></div></label></div><div className=""><p className="">Rate options</p><div className="">{(["fullDay", "halfDay", "hourly"] as const).map((key) => <div key={key} className=""><button type="button" onClick={() => toggleServiceRate(index, key)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${service.rates?.[key] !== undefined ? "border-[#6D28D9] bg-[#6D28D9] text-white" : "border-gray-200 bg-white text-gray-700"}`}>{key === "fullDay" ? "Full Day" : key === "halfDay" ? "Half Day" : "Hourly"}</button>{service.rates?.[key] !== undefined && <input type="number" min="0" value={service.rates[key] || ""} onChange={(e) => updateServiceRate(index, key, e.target.value)} placeholder="Amount" className="" />}</div>)}</div></div></div>)}</div>
                  <button type="button" onClick={addService} className=""><Plus className="" />Add another service</button>
                </>}

                {currentStep === 3 && <>
                  <div className=""><p className="">Business details</p><p className="">These details help prepare your quoting, invoicing, and payment workflows.</p></div>
                  <label className="block">Business name <span className="">Optional</span><input value={business.businessName} onChange={(e) => updateBusiness("businessName", e.target.value)} placeholder="Your studio or business name" className="" /></label>
                  <div className=""><label className="">Phone<input value={business.phone} onChange={(e) => updateBusiness("phone", e.target.value)} placeholder="+254..." className="" /></label><label className="">KRA PIN<input value={business.kraPin} onChange={(e) => updateBusiness("kraPin", e.target.value.toUpperCase())} placeholder="A000000000X" className="" /></label></div>
                  <div className=""><label className=""><div><p className="">VAT registered</p><p className="">Enable if your business is VAT registered.</p></div><input type="checkbox" checked={business.vatRegistered} onChange={(e) => updateBusiness("vatRegistered", e.target.checked)} className="" /></label>{business.vatRegistered && <label className="block">VAT number<input value={business.vatNumber} onChange={(e) => updateBusiness("vatNumber", e.target.value)} className="" /></label>}</div>
                  <div className=""><label className="">Currency<select value={business.currency} onChange={(e) => updateBusiness("currency", e.target.value)} className=""><option>KES</option><option>USD</option><option>EUR</option></select></label><label className="">Deposit %<input type="number" min="0" max="100" value={business.depositPercentage} onChange={(e) => updateBusiness("depositPercentage", e.target.value)} className="" /></label><label className="">WHT rate<select value={business.whtRate} onChange={(e) => updateBusiness("whtRate", e.target.value)} className=""><option value="0">0%</option><option value="5">5%</option><option value="20">20%</option></select></label></div>
                  <button type="button" onClick={skipBusiness} disabled={saving} className="">Skip business details for now</button>
                </>}

                {currentStep === 4 && <><div className=""><div className=""><Check className="" /></div><h3 className="">You&apos;re ready to go.</h3><p className="">Your creator profile and services are set up. Continue building your workspace from the dashboard.</p></div><div className=""><div className=""><UserRound className="" /><div><p className="">Profile</p><p className="">@{profile.handle || suggestedHandle}</p></div><Check className="" /></div><div className=""><BriefcaseBusiness className="" /><div><p className="">Services</p><p className="">{validServiceCount} service{validServiceCount === 1 ? "" : "s"} added</p></div><Check className="" /></div></div><button type="button" onClick={skipToFinish} disabled={saving} className="">Skip remaining setup</button></>}

                {error && <div className="">{error}</div>}
                <div className=""><div>{currentStep > 1 && <button type="button" onClick={() => { setError(""); setCurrentStep((currentStep - 1) as Step); }} disabled={saving} className=""><ArrowLeft className="" />Back</button>}</div><button type="submit" disabled={saving || avatarBusy} className="">{saving ? <><Loader2 className="" />Saving...</> : currentStep === 4 ? <>Enter dashboard<ArrowRight className="" /></> : <>Continue<ArrowRight className="" /></>}</button></div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

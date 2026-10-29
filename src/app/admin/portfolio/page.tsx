"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowSquareOut as ExternalLink,
  CheckCircle,
  Copy,
  Eye,
  Images,
  LinkSimple,
  CircleNotch as Loader2,
  FloppyDisk as Save,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { PortfolioRenderer, type PortfolioData } from "@/components/portfolio-renderer";
import StatusBadge from "@/components/admin/StatusBadge";

type PortfolioProject = PortfolioData["projects"][number] & { visibility: string };
type GallerySelection = {
  id: string;
  title: string;
  category: string | null;
  mediaCount: number;
};
type ApiData = Omit<PortfolioData, "projects"> & {
  projects: PortfolioProject[];
  gallerySelections: GallerySelection[];
  galleryPreviewProjects: PortfolioData["projects"];
  hasPublishedContent: boolean;
};

export default function PortfolioAdminPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [headline, setHeadline] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [layout, setLayout] = useState("editorial");
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  async function loadPortfolio() {
    setLoadError("");
    try {
      const response = await fetch("/api/portfolio", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load portfolio settings. Please try again.");
      const value = (await response.json()) as ApiData;
      setData(value);
      setSelected(Array.isArray(value.portfolio?.selectedProjectIds) ? value.portfolio.selectedProjectIds as string[] : []);
      setHeadline(value.portfolio?.headline || "");
      setContactEmail(value.portfolio?.contactEmail || "");
      setLayout(value.portfolio?.layout || "editorial");
      setPublished(Boolean(value.portfolio?.isPublished));
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : "Could not load portfolio settings.");
    }
  }

  useEffect(() => {
    void loadPortfolio();
  }, []);

  const eligibleProjects = useMemo(
    () => (data?.projects ?? []).filter((project) => project.visibility === "public" && !project.id.startsWith("gallery-")),
    [data],
  );

  const selectedProjects = useMemo(
    () => eligibleProjects.filter((project) => selected.includes(project.id)),
    [eligibleProjects, selected],
  );

  async function save(nextPublished = published) {
    if (saving) return;
    setSaving(true);
    setMessage("Saving portfolio…");
    try {
      const response = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          contactEmail,
          layout,
          selectedProjectIds: selected,
          isPublished: nextPublished,
        }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Could not save portfolio.");
      setPublished(nextPublished);
      setMessage(nextPublished ? "Portfolio published." : "Portfolio saved as draft.");
      await loadPortfolio();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not save portfolio.");
    } finally {
      setSaving(false);
    }
  }

  async function copyPublicUrl() {
    if (!data?.user.handle) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/p/${data.user.handle}`);
      setMessage("Public portfolio URL copied.");
    } catch {
      setMessage("Could not copy the public URL. Open the published portfolio link instead.");
    }
  }

  function toggleProject(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  if (!data) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">
          {loadError ? (
            <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6" role="alert">
              <h1 className="text-lg font-semibold">Portfolio settings unavailable</h1>
              <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
              <Button type="button" variant="outline" className="mt-4" onClick={() => void loadPortfolio()}>Retry</Button>
            </section>
          ) : (
            <section className="space-y-4" role="status" aria-live="polite" aria-label="Loading portfolio settings">
              <div className="h-8 w-56 animate-pulse rounded bg-muted" />
              <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
              <div className="h-48 rounded-xl border bg-card" />
            </section>
          )}
        </div>
      </div>
    );
  }

  const previewData: PortfolioData = {
    ...data,
    portfolio: {
      ...data.portfolio,
      headline,
      contactEmail,
      layout,
      selectedProjectIds: selected,
      isPublished: published,
    },
    projects: [...data.galleryPreviewProjects, ...selectedProjects],
  };

  if (preview) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">
          <AdminPageHeader
            title="Portfolio preview"
            description="Preview the selected projects and presentation settings before publishing."
            breadcrumb={{ label: "Portfolio editor", href: "/admin/portfolio" }}
            primaryAction={<Button variant="outline" size="sm" onClick={() => setPreview(false)}>Back to editor</Button>}
          />
          <div className="mt-6 overflow-hidden rounded-2xl border bg-background">
            <PortfolioRenderer data={previewData} preview />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <AdminPageHeader
          title="Your portfolio"
          description="Curate work from your galleries, choose projects and publish a public-facing portfolio."
          breadcrumb={{ label: "Dashboard", href: "/admin" }}
          primaryAction={<StatusBadge status={published ? "published" : "unpublished"} />}
        />

        <section className="rounded-xl border bg-muted/30 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Images className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold">Your portfolio starts in Galleries</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                Choose whether a gallery contributes all eligible media or only items you explicitly include. You can make item-level choices in each gallery; those choices are reflected here and on your public portfolio.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium">{data.gallerySelections.length} curated {data.gallerySelections.length === 1 ? "gallery" : "galleries"}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm font-medium">{data.gallerySelections.reduce((total, gallery) => total + gallery.mediaCount, 0)} selected media items</span>
                <Button type="button" size="sm" variant="outline" onClick={() => { window.location.href = "/admin/galleries"; }}>
                  Manage galleries <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="border-b px-5 py-4 sm:px-7">
            <h2 className="text-xl font-semibold tracking-tight">Profile and presentation</h2>
            <p className="mt-1 text-sm text-muted-foreground">These details appear on your public creator portfolio.</p>
          </div>
          <div className="grid min-w-0 gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <label className="min-w-0 space-y-1.5">
              <span className="text-sm font-medium leading-none">Portfolio headline</span>
              <Input value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="A short statement about your practice" />
            </label>
            <label className="min-w-0 space-y-1.5">
              <span className="text-sm font-medium leading-none">Public contact email</span>
              <Input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder={data.user.email} />
            </label>
            <label className="min-w-0 space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium leading-none">Portfolio layout</span>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="editorial">Editorial — large images and project stories</SelectItem>
                  <SelectItem value="grid">Grid — compact visual overview</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
        </section>

        <section className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-7">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Curated galleries</h2>
              <p className="mt-1 text-sm text-muted-foreground">These galleries already contribute media selected for public display. Change their selection inside the gallery workspace.</p>
            </div>
            <span className="ui-badge shrink-0">{data.gallerySelections.length} included</span>
          </div>
          {data.gallerySelections.length ? (
            <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-3">
              {data.gallerySelections.map((gallery) => (
                <a key={gallery.id} href={`/admin/galleries/${gallery.id}`} className="group flex min-w-0 items-start gap-3 rounded-xl border p-4 transition hover:border-primary/50 hover:bg-muted/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary"><Images className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{gallery.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{gallery.category || "Gallery"} · {gallery.mediaCount} selected {gallery.mediaCount === 1 ? "item" : "items"}</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">Edit curation <LinkSimple className="h-3.5 w-3.5" /></span>
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-6 sm:p-7">
              <div className="rounded-xl border border-dashed p-6 text-center">
                <Images className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 font-semibold">No gallery media selected yet</h3>
                <p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">Open a gallery, then set its portfolio mode or include individual items. Only eligible, published gallery content will appear on your public portfolio.</p>
                <Button className="mt-4" type="button" variant="outline" onClick={() => { window.location.href = "/admin/galleries"; }}>Choose gallery content <ExternalLink className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-7">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Additional projects</h2>
              <p className="mt-1 text-sm text-muted-foreground">Include published projects that are not already coming from gallery curation.</p>
            </div>
            <span className="ui-badge shrink-0">{selected.length} selected</span>
          </div>
          <div className="grid gap-3 p-5 sm:p-7">
            {eligibleProjects.length ? eligibleProjects.map((project) => (
              <button
                type="button"
                key={project.id}
                onClick={() => toggleProject(project.id)}
                aria-pressed={selected.includes(project.id)}
                className={`flex min-w-0 items-center gap-3 rounded-lg border p-3 text-left transition ${selected.includes(project.id) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
              >
                {selected.includes(project.id) ? <CheckCircle className="h-5 w-5 shrink-0 text-primary" /> : <span className="h-5 w-5 shrink-0 rounded-full border" />}
                <span className="min-w-0 flex-1 truncate font-medium">{project.name}</span>
                <span className="shrink-0 text-sm text-muted-foreground">{selected.includes(project.id) ? "Selected" : "Add to portfolio"}</span>
              </button>
            )) : (
              <p className="text-sm text-muted-foreground">No public projects are available for selection. You can still build your portfolio from curated gallery content.</p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-7">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="primary" disabled={saving} onClick={() => void save()}>{saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}{saving ? "Saving…" : "Save draft"}</Button>
            <Button type="button" variant="outline" onClick={() => setPreview(true)}><Eye className="h-4 w-4" aria-hidden="true" />Preview</Button>
            {published ? <Button type="button" variant="outline" disabled={saving} onClick={() => void save(false)}>Unpublish</Button> : <Button type="button" variant="secondary" disabled={saving} onClick={() => void save(true)}>Publish portfolio</Button>}
            {data.user.handle && published && <Button type="button" variant="ghost" onClick={() => void copyPublicUrl()}><Copy className="h-4 w-4" aria-hidden="true" />Copy public URL</Button>}
          </div>
          <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
            {message && <span>{message}</span>}
          </div>
        </section>

        {published && data.user.handle && (
          <a className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline" href={`/p/${data.user.handle}`} target="_blank" rel="noreferrer">
            Open public portfolio <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

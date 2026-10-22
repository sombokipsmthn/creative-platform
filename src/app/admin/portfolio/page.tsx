"use client";
import { useEffect, useMemo, useState } from "react";
import { Copy, Eye, ExternalLink, GripVertical, Save, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { PortfolioRenderer, type PortfolioData } from "@/components/portfolio-renderer";

type ProjectWithVisibility = PortfolioData["projects"][number] & { visibility: string };
type ApiData = PortfolioData & { projects: ProjectWithVisibility[] };

export default function PortfolioAdminPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [headline, setHeadline] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [layout, setLayout] = useState("editorial");
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetch("/api/portfolio", { cache: "no-store" })
      .then((r) => r.json())
      .then((value: ApiData) => {
        setData(value);
        setSelected(
          Array.isArray(value.portfolio?.selectedProjectIds)
            ? value.portfolio.selectedProjectIds as string[]
            : []
        );
        setHeadline(value.portfolio?.headline || "");
        setContactEmail(value.portfolio?.contactEmail || "");
        setLayout(value.portfolio?.layout || "editorial");
        setPublished(Boolean(value.portfolio?.isPublished));
      })
      .catch(() => setMessage("Could not load portfolio settings."));
  }, []);

  // Projects eligible for selection (visibility = "public" and published)
  const eligible = useMemo(() => {
    if (!data) return [];
    return data.projects.filter(
      (project) => project.visibility === "public"
    );
  }, [data]);

  const galleryItems = useMemo(
    () => data?.projects.filter((project) => project.id.startsWith("gallery-")) ?? [],
    [data],
  );
  const projectItems = useMemo(
    () => eligible.filter((project) => !project.id.startsWith("gallery-")),
    [eligible],
  );

  async function save(nextPublished = published) {
    setMessage("Saving...");
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
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Could not save portfolio.");
      return;
    }
    setPublished(nextPublished);
    setMessage(
      nextPublished ? "Portfolio published." : "Portfolio saved as draft."
    );
  }

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  if (!data) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">Loading portfolio settings...</div>
      </div>
    );
  }

  // Build preview data - includes all portfolio settings plus selected projects
  const previewData: PortfolioData = {
    ...data,
    portfolio: {
      ...(data.portfolio || {
        id: "preview",
        userId: data.user.id,
        socialLinks: {},
        selectedProjectIds: selected,
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: null,
      }),
      headline,
      contactEmail,
      layout,
      selectedProjectIds: selected,
      isPublished: published,
    },
  };

  if (preview) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">
          <AdminPageHeader
            title="Portfolio preview"
            description="Gallery-curated media is primary; published projects remain available as a secondary source."
            breadcrumb={{ label: "Portfolio editor", href: "/admin/portfolio" }}
            primaryAction={
              <Button variant="outline" size="sm" onClick={() => setPreview(false)}>
                Back to editor
              </Button>
            }
          />
          <div className="min-w-0">
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
          description="Choose public projects, arrange the story and publish when ready."
          breadcrumb={{ label: "Dashboard", href: "/admin" }}
          primaryAction={
            <span className={`ui-badge ${published ? "ui-badge-success" : ""}`}>
              {published ? "Published" : "Draft"}
            </span>
          }
        />

        <section className="rounded-xl border bg-muted/30 p-4">
          <div className="flex min-w-0 items-start gap-3">
            <Images className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Gallery-curated content</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Manage primary portfolio media from each gallery workspace. {galleryItems.length} gallery project{galleryItems.length === 1 ? "" : "s"} currently eligible.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="border-b px-5 py-4 sm:px-7">
            <h2 className="text-xl font-semibold tracking-tight">Profile and presentation</h2>
          </div>
          <div className="grid min-w-0 gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <label className="min-w-0 space-y-1.5">
              <span className="text-sm font-medium leading-none">Portfolio headline</span>
              <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="A short statement about your practice" />
            </label>
            <label className="min-w-0 space-y-1.5">
              <span className="text-sm font-medium leading-none">Public contact email</span>
              <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder={data.user.email} />
            </label>
            <label className="min-w-0 space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium leading-none">Layout</span>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="editorial">Editorial</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
        </section>

        <section className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex min-w-0 flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-7">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight">Selected work</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Secondary workflow for published projects. Gallery selections appear automatically and are managed from galleries.
              </p>
            </div>
            <span className="ui-badge shrink-0">{selected.length} selected</span>
          </div>
          <div className="grid min-w-0 gap-3 p-5 sm:p-7">
            {projectItems.length ? projectItems.map((project) => (
              <button
                type="button"
                key={project.id}
                onClick={() => toggle(project.id)}
                className={`flex min-w-0 items-center gap-3 rounded-lg border p-3 text-left ${selected.includes(project.id) ? "border-foreground bg-muted" : "border-border"}`}
              >
                <GripVertical className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{project.name}</span>
                <span className="shrink-0 text-sm">{selected.includes(project.id) ? "Selected" : "Add"}</span>
              </button>
            )) : (
              <p className="text-sm text-muted-foreground">No published projects are available for secondary selection.</p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:p-7">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => save()}><Save className="h-4 w-4" />Save draft</Button>
            <Button variant="outline" onClick={() => setPreview(true)}><Eye className="h-4 w-4" />Preview</Button>
            {published ? <Button variant="outline" onClick={() => save(false)}>Unpublish</Button> : <Button variant="secondary" onClick={() => save(true)}>Publish portfolio</Button>}
            {data.user.handle && published && <Button variant="ghost" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${data.user.handle}`)}><Copy className="h-4 w-4" />Copy public URL</Button>}
          </div>
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
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

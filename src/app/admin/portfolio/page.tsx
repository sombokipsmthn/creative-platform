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
      <div className="min-h-screen p-6 mx-auto w-full max-w-7xl">
        Loading portfolio settings...
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
      <div className="min-h-screen p-6">
        <PortfolioRenderer data={previewData} preview />
        <div className="fixed right-6 top-6 z-10"><AdminPageHeader
          title="Portfolio preview"
          description="Gallery-curated media is primary; published projects remain available as a secondary source."
          breadcrumb={{ label: "Portfolio editor", href: "/admin/portfolio" }}
          primaryAction={
            <Button variant="outline" size="sm" onClick={() => setPreview(false)}>
              Back to editor
            </Button>
          }
        /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
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
      <div className="mx-auto w-full max-w-7xl">
        <section className="mb-6 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-3"><Images className="h-4 w-4 text-primary" /><div><p className="text-sm font-medium">Gallery-curated content</p><p className="text-xs text-muted-foreground">Manage primary portfolio media from each gallery workspace. {galleryItems.length} gallery project{galleryItems.length === 1 ? "" : "s"} currently eligible.</p></div></div>
        </section>
        <section className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Profile and presentation</h2>
          <div className="">
            <label className="block">
              <span className="text-sm font-medium leading-none">
                Portfolio headline
              </span>
              <Input
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="A short statement about your practice"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium leading-none">
                Public contact email
              </span>
              <Input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder={data.user.email}
              />
            </label>
            <label className="block">
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
          <div className="">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Selected work</h2>
              <p className="text-sm text-muted-foreground">
                Secondary workflow for published projects. Gallery selections appear automatically and are managed from galleries.
              </p>
            </div>
            <span className="ui-badge">{selected.length} selected</span>
          </div>
          <div className="">{projectItems.length ? (
            projectItems.map((project) => (
              <button
                type="button"
                key={project.id}
                onClick={() => toggle(project.id)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${selected.includes(project.id) ? "border-foreground bg-muted" : "border-border"}`}
              >
                <GripVertical className="" />
                <span>{project.name}</span>
                <span className="">{selected.includes(project.id) ? "Selected" : "Add"}</span>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No published projects are available for secondary selection.
            </p>
          )}</div>
        </section>

        {/* Status and action buttons */}
        <div className="mt-4">
          <Button variant="primary" onClick={() => save()}>
            <Save className="" />
            Save draft
          </Button>
          <Button variant="outline" onClick={() => setPreview(true)}>
            <Eye className="" />
            Preview
          </Button>
          {published ? (
            <Button variant="outline" onClick={() => save(false)}>
              Unpublish
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => save(true)}>
              Publish portfolio
            </Button>
          )}
          {data.user.handle && published && (
            <Button variant="ghost" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${data.user.handle}`)}>
              <Copy className="" />
              Copy public URL
            </Button>
          )}
          <span className="text-sm text-muted-foreground mt-2">{message}</span>
        </div>

        {published && data.user.handle && (
          <a
            className=""
            href={`/p/${data.user.handle}`}
            target="_blank"
            rel="noreferrer"
          >
            Open public portfolio
            <ExternalLink className="" />
          </a>
        )}
      </div>
    </div>
  );
}

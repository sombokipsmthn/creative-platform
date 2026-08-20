"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Clapperboard,
  Lightbulb,
  Mic,
  Move,
  Plane,
  Search,
  User,
  X,
} from "lucide-react";

export type CatalogEquipment = {
  id: string;
  name: string;
  brand: string;
  category: string;
  specs: string;
  dailyRate: number;
  isPopular?: boolean;
};

const CATEGORY_ICONS: Record<string, typeof Camera> = {
  "A. Professional Fees": User,
  "Professional Fees": User,
  Cameras: Camera,
  Lenses: Camera,
  "Camera Package": Camera,
  Sound: Mic,
  Audio: Mic,
  "Audio Package": Mic,
  Lights: Lightbulb,
  Lighting: Lightbulb,
  Modifiers: Lightbulb,
  "Lighting Package": Lightbulb,
  Stands: Move,
  "Focus Pulling Systems": Move,
  "Grips & Motion": Move,
  "Photography / Video Accessories": Move,
  Drones: Plane,
  "Drones & Action": Plane,
  "C. Post Production": Clapperboard,
  "Post Production": Clapperboard,
};

function displayCategory(category: string) {
  return category.replace(/^[A-Z]\.\s+/, "");
}

function formatKes(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

function inquiryMailto(items: CatalogEquipment[]) {
  const lines = items.map(
    (item) => `• ${item.name} — ${formatKes(item.dailyRate)} / day`
  );
  const total = items.reduce((sum, item) => sum + item.dailyRate, 0);
  const subject = encodeURIComponent(
    `Equipment kit inquiry (${items.length} item${items.length === 1 ? "" : "s"})`
  );
  const body = encodeURIComponent(
    [
      "Hello,",
      "",
      "I would like to inquire about the following production kit:",
      "",
      ...lines,
      "",
      `Estimated daily total: ${formatKes(total)}`,
      "",
      "Dates / location:",
      "Notes:",
    ].join("\n")
  );

  return `mailto:somboriot@gmail.com?subject=${subject}&body=${body}`;
}

export default function EquipmentCatalog({
  items,
}: {
  items: CatalogEquipment[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category)));
    return ["All", ...unique];
  }, [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const haystack = [
        item.name,
        item.brand,
        item.specs,
        item.category,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [items, query, activeCategory]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  const kitTotal = selectedItems.reduce(
    (sum, item) => sum + item.dailyRate,
    0
  );

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form
          role="search"
          className="relative w-full lg:max-w-md"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="equipment-search" className="sr-only">
            Search equipment
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            id="equipment-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cameras, lighting, audio…"
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-purple-950/60"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 dark:hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <p
          id="equipment-results-count"
          aria-live="polite"
          className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-zinc-500"
        >
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
          {activeCategory !== "All"
            ? ` in ${displayCategory(activeCategory)}`
            : ""}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Equipment categories"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {categories.map((category) => {
          const selected = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-mono uppercase tracking-widest transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 ${
                selected
                  ? "bg-purple-600 text-white"
                  : "btn-secondary"
              }`}
            >
              {displayCategory(category)}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div
          role="status"
          className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-950"
        >
          <p className="text-lg font-light text-slate-900 dark:text-white">
            No equipment matches those filters.
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-500">
            Try another category, or clear search to browse the full kit.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveCategory("All");
            }}
            className="mt-6 inline-flex rounded-full px-5 py-2.5 text-xs font-mono uppercase tracking-widest btn-primary"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const Icon = CATEGORY_ICONS[item.category] ?? Camera;
            const selected = selectedIds.includes(item.id);

            return (
              <li key={item.id}>
                <article
                  className={`flex h-full flex-col justify-between rounded-3xl border bg-white p-6 shadow-sm transition dark:bg-zinc-950 ${
                    selected
                      ? "border-purple-500 ring-4 ring-purple-100 dark:ring-purple-950/50"
                      : "border-slate-200 dark:border-zinc-800 hover:border-purple-500/40"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:bg-zinc-900 dark:text-zinc-400">
                          {displayCategory(item.category)}
                        </span>
                        {item.isPopular && (
                          <span className="rounded-full bg-purple-600/15 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-purple-700 dark:text-purple-300">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium leading-snug text-slate-900 dark:text-white">
                        {item.name}
                      </h2>
                      <p className="mt-1 text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400">
                        {item.brand}
                      </p>
                    </div>

                    <p className="min-h-10 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                      {item.specs || "Production-ready equipment available for hire."}
                    </p>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-100 pt-4 dark:border-zinc-800">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                        Daily rate
                      </p>
                      <p className="mt-1 text-xl font-medium text-slate-900 dark:text-white">
                        {formatKes(item.dailyRate)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSelected(item.id)}
                      className={`rounded-full px-4 py-2 text-xs font-mono uppercase tracking-widest transition ${
                        selected ? "btn-primary" : "btn-secondary"
                      }`}
                      aria-pressed={selected}
                    >
                      {selected ? "Selected" : "Add to kit"}
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {selectedItems.length > 0 && (
        <aside className="sticky bottom-4 z-20 rounded-3xl border border-purple-200 bg-white/95 p-5 shadow-xl backdrop-blur dark:border-purple-900/50 dark:bg-zinc-950/95">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400">
                Selected kit
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
                {selectedItems.length} item{selectedItems.length === 1 ? "" : "s"} · estimated daily equipment total
              </p>
              <p className="mt-1 text-2xl font-medium text-slate-900 dark:text-white">
                {formatKes(kitTotal)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="rounded-full px-4 py-2 text-xs font-mono uppercase tracking-widest btn-secondary"
              >
                Clear kit
              </button>
              <Link
                href={inquiryMailto(selectedItems)}
                className="rounded-full px-4 py-2 text-xs font-mono uppercase tracking-widest btn-primary"
              >
                Request quote
              </Link>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

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
    <div className="">
      <div className="">
        <form
          role="search"
          className=""
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="equipment-search" className="sr-only">
            Search equipment
          </label>
          <Search
            aria-hidden="true"
            className=""
          />
          <input
            id="equipment-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cameras, lighting, audio…"
            autoComplete="off"
            className="placeholder:text-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className=""
              aria-label="Clear search"
            >
              <X className="" />
            </button>
          )}
        </form>

        <p
          id="equipment-results-count"
          aria-live="polite"
          className=""
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
        className="-mx-1"
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
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-sans uppercase tracking-widest transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                selected
                  ? "bg-primary text-white"
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
          className=""
        >
          <p className="">
            No equipment matches those filters.
          </p>
          <p className="">
            Try another category, or clear search to browse the full kit.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveCategory("All");
            }}
            className="btn-primary"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <ul className="">
          {filtered.map((item) => {
            const Icon = CATEGORY_ICONS[item.category] ?? Camera;
            const selected = selectedIds.includes(item.id);

            return (
              <li key={item.id}>
                <article
                  className={`flex h-full flex-col justify-between rounded-3xl border bg-white p-6 shadow-sm transition dark:bg-zinc-950 ${
                    selected
                      ? "border-primary ring-4 ring-ring dark:ring-ring"
                      : "border-slate-200 dark:border-zinc-800 hover:border-primary/40"
                  }`}
                >
                  <div className="">
                    <div className="">
                      <div className="">
                        <Icon aria-hidden="true" className="" />
                      </div>
                      <div className="">
                        <span className="">
                          {displayCategory(item.category)}
                        </span>
                        {item.isPopular && (
                          <span className="">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="">
                        {item.name}
                      </h2>
                      <p className="">
                        {item.brand}
                      </p>
                    </div>

                    <p className="">
                      {item.specs || "Production-ready equipment available for hire."}
                    </p>
                  </div>

                  <div className="">
                    <div>
                      <p className="">
                        Daily rate
                      </p>
                      <p className="">
                        {formatKes(item.dailyRate)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSelected(item.id)}
                      className={`rounded-full px-4 py-2 text-xs font-sans uppercase tracking-widest transition ${
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
        <aside className="">
          <div className="">
            <div>
              <p className="">
                Selected kit
              </p>
              <p className="">
                {selectedItems.length} item{selectedItems.length === 1 ? "" : "s"} · estimated daily equipment total
              </p>
              <p className="">
                {formatKes(kitTotal)}
              </p>
            </div>

            <div className="">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="btn-secondary"
              >
                Clear kit
              </button>
              <Link
                href={inquiryMailto(selectedItems)}
                className="btn-primary"
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

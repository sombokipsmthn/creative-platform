import Link from "next/link";
import Header from "@/components/header";
import ThemeToggle from "@/components/ThemeToggle";
import EquipmentCatalog, {
  type CatalogEquipment,
} from "@/components/EquipmentCatalog";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { asc } from "drizzle-orm";

export const metadata = {
  title: "Production Equipment | KIPSMTHN",
  description:
    "Browse cameras, lighting, audio, grips, and drones available for production in Nairobi.",
};

async function loadEquipment(): Promise<CatalogEquipment[]> {
  const rows = await db
    .select()
    .from(equipment)
    .orderBy(asc(equipment.category), asc(equipment.name));

  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    brand: item.brand || "KIPSMTHN",
    category: item.category,
    specs: item.specs || "",
    dailyRate: item.dailyRate,
  }));
}

export default async function EquipmentPage() {
  const items = await loadEquipment();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans transition-colors duration-300 dark:bg-[#09090b] dark:text-zinc-100">
      <a
        href="#equipment-catalog"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-xs focus:font-mono focus:uppercase focus:tracking-widest focus:text-white"
      >
        Skip to equipment catalog
      </a>

      <Header />

      <section className="relative mx-auto max-w-7xl px-6 pb-12 pt-36 text-center">
        <div className="pointer-events-none absolute top-1/4 left-1/2 h-100 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/15 blur-3xl" />

        <p className="text-xs font-mono font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
          Production kit
        </p>

        <h1 className="heading-editorial mx-auto mt-4 max-w-4xl text-slate-900 dark:text-white">
          Equipment available for{" "}
          <span className="font-normal text-purple-600 dark:text-purple-400">
            Nairobi productions
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed text-slate-600 md:text-base dark:text-zinc-400">
          Cameras, lighting, audio, grips, and drones billed as daily production
          rates. Build a kit, then request availability and a quote.
        </p>
      </section>

      <main
        id="equipment-catalog"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-6 pb-28 outline-none"
      >
        <EquipmentCatalog items={items} />
      </main>

      <footer className="mt-8 rounded-t-3xl border-t border-slate-200 bg-slate-100 px-6 pt-16 pb-12 dark:border-zinc-900 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-[11px] font-mono text-slate-500 sm:flex-row dark:text-zinc-600">
          <p>
            © {new Date().getFullYear()} KIPSMTHN Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/contact"
              className="hover:text-purple-600 dark:hover:text-purple-400"
            >
              Start a project
            </Link>
            <ThemeToggle />
            <span>Nairobi, Kenya</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

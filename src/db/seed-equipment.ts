import readXlsxFile from "read-excel-file/node";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { equipment } from "./schema";

const workbookPath = path.resolve(
  process.argv[2] || path.join(process.cwd(), "africa_grips_equipment_with_images(1).xlsx")
);

function clean(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function numberValue(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

/**
 * One-time catalogue import.
 *
 * This script is never used by the application at runtime. Once imported,
 * PostgreSQL is the source of truth. Existing equipment is deliberately
 * skipped so rerunning this script cannot overwrite rates, descriptions,
 * categories, or images that have since been edited in the platform.
 */
async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed equipment.");
  }

  const rows = await readXlsxFile(workbookPath, { sheet: "Equipment" });
  if (rows.length < 2) throw new Error("The Equipment sheet is empty.");

  const headers = new Map<string, number>();
  rows[0].forEach((value, index) => {
    const header = clean(value);
    if (header) headers.set(header, index);
  });

  const valueAt = (row: unknown[], header: string) => {
    const index = headers.get(header);
    return index === undefined ? null : row[index];
  };

  let imported = 0;
  let skipped = 0;
  const categories = new Set<string>();

  await db.transaction(async (tx) => {
    for (const row of rows.slice(1)) {
      const name = clean(valueAt(row, "Equipment"));
      const category = clean(valueAt(row, "Category"));
      if (!name || !category) continue;

      categories.add(category);

      const [existing] = await tx
        .select({ id: equipment.id })
        .from(equipment)
        .where(eq(equipment.name, name))
        .limit(1);

      if (existing) {
        skipped += 1;
        continue;
      }

      const imageUrl =
        clean(valueAt(row, "Image Search")) ||
        clean(valueAt(row, "Image"));

      await tx.insert(equipment).values({
        name,
        dailyRate: numberValue(valueAt(row, "Cost (KES)")),
        category,
        subcategory: clean(valueAt(row, "Subcategory")),
        brand: clean(valueAt(row, "Brand")),
        specs: clean(valueAt(row, "Key Features / Specs")),
        imageUrl,
      });

      imported += 1;
    }
  });

  console.log(
    [
      "Equipment catalogue import complete.",
      `Added: ${imported}`,
      `Skipped existing records: ${skipped}`,
      `Categories found in workbook: ${categories.size}`,
      `Source rows processed: ${rows.length - 1}`,
    ].join("\n")
  );
}

seed().catch((error) => {
  console.error("Equipment import failed:", error);
  process.exit(1);
});

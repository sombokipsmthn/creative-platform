import readXlsxFile from "read-excel-file/node";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { eq, sql } from "drizzle-orm";
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
 * Some spreadsheet writers emit empty inline-string cells as <c ...></c>.
 * read-excel-file expects an <is> child for inline strings, so normalize only
 * those empty cells in a temporary copy before parsing the workbook.
 */
async function getReadableWorkbookPath(sourcePath: string): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "equipment-import-"));
  const tempPath = path.join(tempDir, "equipment.xlsx");

  try {
    const archive = unzipSync(new Uint8Array(await readFile(sourcePath)));
    for (const [name, contents] of Object.entries(archive)) {
      if (!/^xl\/worksheets\/[^/]+\.xml$/.test(name)) continue;
      let xml = strFromU8(contents);
      xml = xml.replace(
        /<c\b([^>]*\bt="inlineStr"[^>]*)\s*><\/c>/g,
        "<c$1><is><t></t></is></c>"
      );
      archive[name] = strToU8(xml);
    }
    await writeFile(tempPath, zipSync(archive));
    return { path: tempPath, cleanup: () => rm(tempDir, { recursive: true, force: true }) };
  } catch (error) {
    await rm(tempDir, { recursive: true, force: true });
    throw error;
  }
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

  const normalizedWorkbook = await getReadableWorkbookPath(workbookPath);
  let rows;
  try {
    rows = await readXlsxFile(normalizedWorkbook.path, { sheet: "Equipment" });
  } finally {
    await normalizedWorkbook.cleanup();
  }

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
    // Ensure existing local databases have image storage without running a schema migration.
    await tx.execute(sql`ALTER TABLE "equipment" ADD COLUMN IF NOT EXISTS "image_url" text`);

    for (const row of rows.slice(1)) {
      const name = clean(valueAt(row, "Equipment"));
      const category = clean(valueAt(row, "Category"));
      if (!name || !category) continue;

      categories.add(category);

      const [existing] = await tx
        .select({ id: equipment.id, imageUrl: equipment.imageUrl })
        .from(equipment)
        .where(eq(equipment.name, name))
        .limit(1);

      const imageUrl = clean(valueAt(row, "Image Search")) || clean(valueAt(row, "Image"));

      if (existing) {
        // Backfill only a missing image URL; preserve all user-edited fields.
        if (!existing.imageUrl && imageUrl) {
          await tx
            .update(equipment)
            .set({ imageUrl, updatedAt: new Date() })
            .where(eq(equipment.id, existing.id));
        }
        skipped += 1;
        continue;
      }

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

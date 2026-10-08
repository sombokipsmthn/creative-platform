import readXlsxFile from "read-excel-file/node";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { equipment } from "./schema";

const workbookPath = path.join(
  process.cwd(),
  "africa_grips_equipment_with_images(1).xlsx"
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
  let updated = 0;

  await db.transaction(async (tx) => {
    for (const row of rows.slice(1)) {
      const name = clean(valueAt(row, "Equipment"));
      const category = clean(valueAt(row, "Category"));
      if (!name || !category) continue;

      const data = {
        name,
        dailyRate: numberValue(valueAt(row, "Cost (KES)")),
        category,
        subcategory: clean(valueAt(row, "Subcategory")),
        brand: clean(valueAt(row, "Brand")),
        specs: clean(valueAt(row, "Key Features / Specs")),
      };

      const [existing] = await tx
        .select({ id: equipment.id })
        .from(equipment)
        .where(sql`${equipment.name} = ${name}`)
        .limit(1);
      const imageUrl = clean(valueAt(row, "Image Search"));

      if (existing) {
        await tx.update(equipment).set({ ...data, updatedAt: new Date() }).where(sql`${equipment.id} = ${existing.id}`);
        await tx.execute(sql`UPDATE equipment SET image_url = ${imageUrl} WHERE id = ${existing.id}`);
        updated += 1;
      } else {
        const [created] = await tx.insert(equipment).values(data).returning({ id: equipment.id });
        if (created) {
          await tx.execute(sql`UPDATE equipment SET image_url = ${imageUrl} WHERE id = ${created.id}`);
          imported += 1;
        }
      }
    }
  });

  console.log(`Equipment import complete: ${imported} added, ${updated} updated, ${rows.length - 1} source rows processed.`);
}

seed().catch((error) => {
  console.error("Equipment import failed:", error);
  process.exit(1);
});

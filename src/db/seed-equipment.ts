import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import path from "node:path";
import { sql } from "drizzle-orm";
import * as XLSX from "xlsx";
import { db } from "./index";
import { equipment } from "./schema";

const workbookPath = path.join(
  process.cwd(),
  "africa_grips_equipment_with_images(1).xlsx"
);

function clean(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

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

  const workbook = XLSX.readFile(workbookPath);
  const sheet = workbook.Sheets["Equipment"];

  if (!sheet) {
    throw new Error('The workbook does not contain an "Equipment" sheet.');
  }
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed equipment.");
}
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  });

  if (rows.length === 0) {
    throw new Error("The Equipment sheet is empty.");
  }

  let imported = 0;
  let updated = 0;

  await db.transaction(async (tx) => {
    for (const row of rows) {
      const name = clean(row["Equipment"]);
      const category = clean(row["Category"]);

      if (!name || !category) {
        continue;
      }

      const data = {
        name,
        dailyRate: numberValue(row["Cost (KES)"]),
        category,
        subcategory: clean(row["Subcategory"]),
        brand: clean(row["Brand"]),
        specs: clean(row["Key Features / Specs"]),
      };

      const [existing] = await tx
        .select({ id: equipment.id })
        .from(equipment)
        .where(sql`${equipment.name} = ${name}`)
        .limit(1);

      const imageUrl = clean(row["Image Search"]);

      if (existing) {
        await tx
          .update(equipment)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(sql`${equipment.id} = ${existing.id}`);

        await tx.execute(
          sql`UPDATE equipment SET image_url = ${imageUrl} WHERE id = ${existing.id}`
        );

        updated += 1;
        continue;
      }

      const [created] = await tx
        .insert(equipment)
        .values(data)
        .returning({ id: equipment.id });

      if (created) {
        await tx.execute(
          sql`UPDATE equipment SET image_url = ${imageUrl} WHERE id = ${created.id}`
        );

        imported += 1;
      }
    }
  });

  console.log(
    `Equipment import complete: ${imported} added, ${updated} updated, ${rows.length} source rows processed.`
  );
}

seed().catch((error) => {
  console.error("Equipment import failed:", error);
  process.exit(1);
});

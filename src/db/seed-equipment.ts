import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import path from "node:path";
import * as XLSX from "xlsx";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { equipment } from "./schema";

const workbookPath = path.join(
  process.cwd(),
  "africa_grips_equipment_with_images(1).xlsx"
);

const REQUIRED_COLUMNS = [
  "Equipment",
  "Cost (KES)",
  "Category",
  "Subcategory",
  "Brand",
  "Key Features / Specs",
];

function clean(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function numberValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }

  const text = clean(value);
  if (!text) return 0;

  // Handles Excel values such as 8000, "8,000", or "KES 8,000".
  const normalized = text.replace(/[^0-9.-]/g, "");
  const number = Number(normalized);

  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to import equipment.");
  }

  const workbook = XLSX.readFile(workbookPath);
  const sheet = workbook.Sheets["Equipment"];

  if (!sheet) {
    throw new Error('The workbook does not contain an "Equipment" sheet.');
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  });

  if (rows.length === 0) {
    throw new Error("The Equipment sheet is empty.");
  }

  const headers = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    header: 1,
    defval: null,
  })[0] as unknown[] | undefined;

  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !headers?.some((header) => String(header).trim() === column)
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `Missing required Excel columns: ${missingColumns.join(", ")}`
    );
  }

  const records = rows
    .map((row, index) => {
      const name = clean(row["Equipment"]);
      const category = clean(row["Category"]);

      if (!name || !category) {
        return {
          rowNumber: index + 2,
          record: null,
        };
      }

      return {
        rowNumber: index + 2,
        record: {
          name,
          dailyRate: numberValue(row["Cost (KES)"]),
          category,
          subcategory: clean(row["Subcategory"]),
          brand: clean(row["Brand"]),
          specs: clean(row["Key Features / Specs"]),
          imageUrl: clean(row["Image Search"]),
        },
      };
    })
    .filter(
      (item): item is {
        rowNumber: number;
        record: {
          name: string;
          dailyRate: number;
          category: string;
          subcategory: string | null;
          brand: string | null;
          specs: string | null;
          imageUrl: string | null;
        };
      } => item.record !== null
    );

  const skipped = rows.length - records.length;

  if (records.length !== 389) {
    throw new Error(
      `Expected 389 equipment records from the spreadsheet, but found ${records.length} valid records. No database changes were made.`
    );
  }

  const names = new Set<string>();
  const duplicateNames: string[] = [];

  for (const { record } of records) {
    const key = record.name.toLowerCase();
    if (names.has(key)) duplicateNames.push(record.name);
    names.add(key);
  }

  if (duplicateNames.length > 0) {
    throw new Error(
      `Duplicate equipment names found in Excel: ${[...new Set(duplicateNames)].join(", ")}. No database changes were made.`
    );
  }

  let imported = 0;
  let updated = 0;

  await db.transaction(async (tx) => {
    for (const { record } of records) {
      const { imageUrl, ...data } = record;

      const [existing] = await tx
        .select({ id: equipment.id })
        .from(equipment)
        .where(sql`LOWER(${equipment.name}) = LOWER(${record.name})`)
        .limit(1);

      if (existing) {
        await tx
          .update(equipment)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(sql`${equipment.id} = ${existing.id}`);

        // image_url exists in the database migration but is not yet exposed
        // by the Drizzle schema, so keep this update SQL-based for now.
        await tx.execute(
          sql`UPDATE equipment SET image_url = ${imageUrl} WHERE id = ${existing.id}`
        );

        updated += 1;
      } else {
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
    }
  });

  console.log(
    `Equipment import complete: ${imported} added, ${updated} updated, ${skipped} skipped, ${rows.length} source rows processed.`
  );
}

seed().catch((error) => {
  console.error("Equipment import failed:", error);
  process.exit(1);
});

import fs from "node:fs";
import path from "node:path";
import readXlsxFile from "read-excel-file/node";

const inputFile = path.resolve("africa_grips_equipment_with_images(1).xlsx");
const outputFile = path.resolve("src/db/equipment.json");

if (!fs.existsSync(inputFile)) throw new Error(`Excel file not found: ${inputFile}`);

const rows = await readXlsxFile(inputFile, { sheet: "Equipment" });
if (rows.length < 2) throw new Error('The workbook does not contain a usable "Equipment" sheet.');

const headers = new Map();
rows[0].forEach((value, index) => {
  const header = value == null ? "" : String(value).trim();
  if (header) headers.set(header, index);
});

const valueAt = (row, header) => {
  const index = headers.get(header);
  return index === undefined ? null : row[index];
};

const equipment = rows
  .slice(1)
  .map((row) => ({
    Equipment: String(valueAt(row, "Equipment") ?? "").trim(),
    "Cost (KES)": Number(valueAt(row, "Cost (KES)")) || 0,
    Category: String(valueAt(row, "Category") ?? "").trim(),
    Subcategory: String(valueAt(row, "Subcategory") ?? "").trim() || null,
    Brand: String(valueAt(row, "Brand") ?? "").trim() || null,
    "Key Features / Specs": String(valueAt(row, "Key Features / Specs") ?? "").trim() || null,
  }))
  .filter((item) => item.Equipment);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(equipment, null, 2) + "\n", "utf8");
console.log(`Created ${outputFile}`);
console.log(`Imported ${equipment.length} equipment records.`);

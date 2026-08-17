import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const inputFile = path.resolve(
  "africa_grips_equipment_with_images(1).xlsx"
);

const outputFile = path.resolve("src/db/equipment.json");

if (!fs.existsSync(inputFile)) {
  throw new Error(`Excel file not found: ${inputFile}`);
}

const workbook = XLSX.readFile(inputFile);

if (!workbook.SheetNames.includes("Equipment")) {
  throw new Error('The workbook does not contain an "Equipment" sheet.');
}

const sheet = workbook.Sheets["Equipment"];

const rows = XLSX.utils.sheet_to_json(sheet, {
  defval: null,
});

const equipment = rows
  .map((item) => ({
    Equipment: item["Equipment"]?.toString().trim() || "",
    "Cost (KES)": Number(item["Cost (KES)"]) || 0,
    Category: item["Category"]?.toString().trim() || "",
    Subcategory: item["Subcategory"]?.toString().trim() || null,
    Brand: item["Brand"]?.toString().trim() || null,
    "Key Features / Specs":
      item["Key Features / Specs"]?.toString().trim() || null,
  }))
  .filter((item) => item.Equipment);

fs.mkdirSync(path.dirname(outputFile), {
  recursive: true,
});

fs.writeFileSync(
  outputFile,
  JSON.stringify(equipment, null, 2) + "\n",
  "utf8"
);

console.log(`Created ${outputFile}`);
console.log(`Imported ${equipment.length} equipment records.`);
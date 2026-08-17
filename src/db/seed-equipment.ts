import { db } from "./index";
import { equipment } from "./schema";
import equipmentData from "./equipment.json";

async function seed() {
  if (equipmentData.length === 0) {
    throw new Error("No equipment records found.");
  }

  await db.insert(equipment).values(
    equipmentData.map((item) => ({
      name: item.Equipment,
      dailyRate: item["Cost (KES)"],
      category: item.Category,
      subcategory: item.Subcategory,
      brand: item.Brand,
      specs: item["Key Features / Specs"],
    }))
  );

  console.log(`Equipment imported: ${equipmentData.length} records`);
}

seed().catch((error) => {
  console.error("Equipment import failed:", error);
  process.exit(1);
});
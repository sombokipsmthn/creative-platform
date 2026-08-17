import { db } from "./index";
import { equipment } from "./schema";
import equipmentData from "./equipment.json";

async function seed() {
  await db.insert(equipment).values(
    equipmentData.map((item) => ({
      name: item.Equipment,
      dailyRate: item["Cost (KES)"],
      category: item.Category,
      subcategory: item.Subcategory ?? null,
      brand: item.Brand ?? null,
      specs: item["Key Features / Specs"] ?? null,
    }))
  );

  console.log("Equipment imported successfully");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function EquipmentPage() {
  const items = await db
    .select()
    .from(equipment)
    .orderBy(desc(equipment.createdAt));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Equipment Inventory
          </h1>
          <p className="text-gray-500">
            Manage your rental equipment and pricing
          </p>
        </div>

        <button className="bg-black text-white px-4 py-2 rounded-lg">
          Add Equipment
        </button>
      </div>

      <div className="grid gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-5 flex justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold">
                {item.name}
              </h2>

              <p className="text-gray-500">
                {item.brand} • {item.category}
              </p>

              <p className="mt-2">
                {item.specs}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-lg">
                KES {item.dailyRate}
              </p>

              <p className="text-sm text-gray-500">
                per day
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
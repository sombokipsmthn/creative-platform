import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { equipment } from "@/db/schema";

function normalizeEquipment(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "").trim();
  const subcategory = String(body.subcategory ?? "").trim();
  const brand = String(body.brand ?? "").trim();
  const specs = String(body.specs ?? "").trim();

  const dailyRate = Math.max(
    0,
    Math.round(Number(body.dailyRate) || 0)
  );

  return {
    name,
    dailyRate,
    category,
    subcategory: subcategory || null,
    brand: brand || null,
    specs: specs || null,
  };
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(equipment.name, `%${search}%`),
          ilike(equipment.category, `%${search}%`),
          ilike(equipment.subcategory, `%${search}%`),
          ilike(equipment.brand, `%${search}%`),
          ilike(equipment.specs, `%${search}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(equipment.category, category));
    }

    const results = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        dailyRate: equipment.dailyRate,
        category: equipment.category,
        subcategory: equipment.subcategory,
        brand: equipment.brand,
        specs: equipment.specs,
      })
      .from(equipment)
      .where(
        conditions.length > 0
          ? and(...conditions)
          : undefined
      )
      .orderBy(
        asc(equipment.category),
        asc(equipment.name)
      );

    return NextResponse.json(results);
  } catch (error) {
    console.error(
      "GET /api/equipment error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch equipment",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const normalized = normalizeEquipment(body);

    if (!normalized.name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    if (!normalized.category) {
      return NextResponse.json(
        { error: "category is required" },
        { status: 400 }
      );
    }

    const [createdEquipment] = await db
      .insert(equipment)
      .values(normalized)
      .returning();

    if (!createdEquipment) {
      throw new Error("Equipment was not created");
    }

    return NextResponse.json(createdEquipment, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "POST /api/equipment error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    );
  }
}

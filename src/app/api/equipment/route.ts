import { NextResponse } from "next/server";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { desc } from "drizzle-orm";


export async function GET() {
  try {
    const items = await db
      .select()
      .from(equipment)
      .orderBy(desc(equipment.createdAt));

    return NextResponse.json(items);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}



export async function POST(request: Request) {

  try {

    const body = await request.json();


    const result = await db
      .insert(equipment)
      .values({
        name: body.name,
        dailyRate: Number(body.dailyRate),
        category: body.category,
        subcategory: body.subcategory || null,
        brand: body.brand || null,
        specs: body.specs || null,
      })
      .returning();


    return NextResponse.json(result[0]);

  } catch(error){

    console.error(error);

    return NextResponse.json(
      {error:"Failed to create equipment"},
      {status:500}
    );

  }
}
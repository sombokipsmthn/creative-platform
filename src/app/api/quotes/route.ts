import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, quoteItems } from "@/db/schema";
import { desc } from "drizzle-orm";


// GET ALL QUOTES

export async function GET(request: Request) {

  try {
    const { searchParams } = new URL(request.url);

    const limitParam = Number(searchParams.get("limit") ?? 100);
    const offsetParam = Number(searchParams.get("offset") ?? 0);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 1000) : 100;
    const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

    const result = await db
      .select()
      .from(quotes)
      .orderBy(desc(quotes.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(result);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch quotes"
      },
      {
        status: 500
      }
    );

  }

}





// CREATE QUOTE

export async function POST(
  request: Request
) {

  try {

    const body = await request.json();


    const {
      title,
      projectName,
      currency,
      paymentTerms,
      subtotal,
      tax,
      total,
      items
    } = body;



    const quote = await db
      .insert(quotes)
      .values({

        title,

        projectName,

        currency,

        paymentTerms,

        subtotal,

        tax,

        total,

      })
      .returning();



    const quoteId = quote[0].id;



    if (items && items.length > 0) {


      await db
        .insert(quoteItems)
        .values(

          items.map((item:{category:string;description:string;quantity:number;rate:number;amount:number})=>({

            quoteId,

            category:item.category,

            description:item.description,

            quantity:item.quantity,

            unit:"unit",

            rate:item.rate,

            amount:item.amount,

          }))

        );

    }



    return NextResponse.json(
      quote[0],
      {
        status:201
      }
    );


  } catch(error){

    console.error(error);


    return NextResponse.json(
      {
        error:"Failed to create quote"
      },
      {
        status:500
      }
    );

  }

}
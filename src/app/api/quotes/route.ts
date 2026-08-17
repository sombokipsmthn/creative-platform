import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, quoteItems } from "@/db/schema";
import { desc } from "drizzle-orm";


// GET ALL QUOTES

export async function GET() {

  try {

    const result = await db
      .select()
      .from(quotes)
      .orderBy(desc(quotes.createdAt));


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

          items.map((item:any)=>({

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
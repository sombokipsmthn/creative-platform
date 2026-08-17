import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, quoteItems, clients } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {

  try {

    const { id } = await context.params;


    const quoteResult = await db
      .select({
        quote: quotes,
        client: clients,
      })
      .from(quotes)
      .leftJoin(
        clients,
        eq(quotes.clientId, clients.id)
      )
      .where(eq(quotes.id, id))
      .limit(1);



    if (quoteResult.length === 0) {

      return NextResponse.json(
        {
          error: "Quote not found",
        },
        {
          status: 404,
        }
      );

    }



    const items = await db
      .select()
      .from(quoteItems)
      .where(
        eq(quoteItems.quoteId, id)
      );



    return NextResponse.json({

      ...quoteResult[0].quote,

      client: quoteResult[0].client,

      items,

    });



  } catch (error) {

    console.error(
      "QUOTE FETCH ERROR:",
      error
    );


    return NextResponse.json(
      {
        error: "Failed to fetch quote",
      },
      {
        status: 500,
      }
    );

  }

}
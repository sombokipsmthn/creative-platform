"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";


export default function QuoteDetailPage() {

  const params = useParams();

  const id = params.id as string;


  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    async function loadQuote() {

      const res = await fetch(`/api/quotes/${id}`);

      const data = await res.json();

      setQuote(data);

      setLoading(false);

    }


    loadQuote();

  }, [id]);



  if (loading) {

    return (
      <div className="p-10">
        Loading quote...
      </div>
    );

  }



  if (!quote) {

    return (
      <div className="p-10">
        Quote not found
      </div>
    );

  }



  const groupedItems =
    quote.items?.reduce(
      (
        acc: any,
        item: any
      ) => {

        if (!acc[item.category]) {

          acc[item.category] = [];

        }


        acc[item.category].push(item);


        return acc;

      },
      {}
    ) || {};



  const deposit =
    Math.round(
      (quote.total *
        (quote.depositPercentage || 50)) /
        100
    );


  const balance =
    quote.total - deposit;



  return (

    <div className="max-w-5xl mx-auto p-8 space-y-8">


      {/* HEADER */}

      <div className="flex justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            SOMBOS CREATIVE
          </h1>

          <p className="text-gray-500">
            Production Quote
          </p>

        </div>


        <div className="text-right">

          <h2 className="text-xl font-bold">
            {quote.quoteNumber || "QUOTE"}
          </h2>

          <p>
            Status: {quote.status}
          </p>

        </div>

      </div>




      {/* CLIENT */}

      <section className="border rounded-xl p-6">

        <h2 className="font-bold text-xl mb-4">
          Client Information
        </h2>


        <p>
          <strong>Name:</strong>{" "}
          {quote.client?.name}
        </p>


        <p>
          <strong>Company:</strong>{" "}
          {quote.client?.company || "-"}
        </p>


        <p>
          <strong>Email:</strong>{" "}
          {quote.client?.email || "-"}
        </p>


        <p>
          <strong>Phone:</strong>{" "}
          {quote.client?.phone || "-"}
        </p>


      </section>





      {/* PROJECT */}

      <section className="border rounded-xl p-6">


        <h2 className="font-bold text-xl mb-4">
          Production Details
        </h2>


        <div className="grid grid-cols-2 gap-4">


          <p>
            <strong>Project:</strong>{" "}
            {quote.projectName || quote.title}
          </p>


          <p>
            <strong>Location:</strong>{" "}
            {quote.location || "-"}
          </p>


          <p>
            <strong>Production Days:</strong>{" "}
            {quote.productionDays || 1}
          </p>


          <p>
            <strong>Valid Until:</strong>{" "}
            {quote.validUntil
              ? new Date(
                  quote.validUntil
                ).toLocaleDateString()
              : "-"
            }
          </p>


        </div>


      </section>





      {/* ITEMS */}

      <section className="border rounded-xl p-6">


        <h2 className="font-bold text-xl mb-6">
          Quote Breakdown
        </h2>



        {Object.keys(groupedItems).map(
          (category) => (

          <div
            key={category}
            className="mb-8"
          >


            <h3 className="font-bold text-lg mb-3">
              {category}
            </h3>


            <div className="space-y-3">


              {groupedItems[category].map(
                (item:any)=> (

                <div
                  key={item.id}
                  className="flex justify-between border-b pb-2"
                >

                  <div>

                    <p>
                      {item.description}
                    </p>


                    <p className="text-sm text-gray-500">

                      {item.quantity}
                      {" "}
                      {item.unit}
                      {" × "}
                      {quote.currency}
                      {" "}
                      {item.rate}

                    </p>

                  </div>


                  <div className="font-semibold">

                    {quote.currency}
                    {" "}
                    {item.amount.toLocaleString()}

                  </div>


                </div>


              ))}


            </div>


          </div>


        ))}


      </section>





      {/* TOTALS */}

      <section className="border rounded-xl p-6">


        <div className="space-y-3 text-right">


          <p>
            Subtotal:
            {" "}
            {quote.currency}
            {" "}
            {quote.subtotal.toLocaleString()}
          </p>


          <p>
            Tax:
            {" "}
            {quote.currency}
            {" "}
            {quote.tax.toLocaleString()}
          </p>



          <p className="text-2xl font-bold">

            Total:
            {" "}
            {quote.currency}
            {" "}
            {quote.total.toLocaleString()}

          </p>



          <hr />


          <p>

            Deposit Required:
            {" "}
            {quote.currency}
            {" "}
            {deposit.toLocaleString()}

          </p>


          <p>

            Balance:
            {" "}
            {quote.currency}
            {" "}
            {balance.toLocaleString()}

          </p>


        </div>


      </section>





      {/* TERMS */}

      <section className="border rounded-xl p-6">


        <h2 className="font-bold text-xl mb-3">
          Payment Terms
        </h2>


        <p>
          {quote.paymentTerms ||
          "50% deposit required to confirm production. Balance payable on completion."}
        </p>


      </section>



    </div>

  );

}
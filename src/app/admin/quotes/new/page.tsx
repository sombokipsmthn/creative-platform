"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


type Quote = {
  id: string;
  title: string;
  projectName?: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
};


export default function QuotesPage() {

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [search, setSearch] = useState("");


  useEffect(() => {

    fetch("/api/quotes")
      .then((res) => res.json())
      .then((data) => {
        setQuotes(data);
      });

  }, []);



  const filteredQuotes = quotes.filter((quote) => {

    const text =
      `${quote.title} ${quote.projectName ?? ""}`
        .toLowerCase();

    return text.includes(search.toLowerCase());

  });



  return (

    <div className="p-8 max-w-6xl mx-auto">


      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Quotes
          </h1>

          <p className="text-gray-600">
            Production estimates and client proposals
          </p>

        </div>


        <Link
          href="/admin/quotes/new"
          className="bg-black text-white px-5 py-3 rounded"
        >
          New Quote
        </Link>


      </div>



      <input

        className="border rounded p-3 w-full mb-6"

        placeholder="Search quotes..."

        value={search}

        onChange={(e)=>setSearch(e.target.value)}

      />




      <div className="border rounded overflow-hidden">


        <table className="w-full">


          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Quote
              </th>


              <th className="text-left p-4">
                Project
              </th>


              <th className="text-left p-4">
                Status
              </th>


              <th className="text-right p-4">
                Total
              </th>


              <th className="p-4">
                Action
              </th>


            </tr>

          </thead>



          <tbody>


            {filteredQuotes.map((quote)=>(


              <tr
                key={quote.id}
                className="border-t"
              >


                <td className="p-4 font-semibold">

                  {quote.title}

                </td>



                <td className="p-4">

                  {quote.projectName || "-"}

                </td>



                <td className="p-4">

                  <span className="px-3 py-1 rounded bg-gray-200">

                    {quote.status}

                  </span>

                </td>



                <td className="p-4 text-right">

                  {quote.currency} {quote.total.toLocaleString()}

                </td>



                <td className="p-4 text-center">


                  <Link

                    href={`/admin/quotes/${quote.id}`}

                    className="text-blue-600"

                  >

                    View

                  </Link>


                </td>


              </tr>


            ))}



            {filteredQuotes.length === 0 && (

              <tr>

                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500"
                >

                  No quotes found

                </td>

              </tr>

            )}



          </tbody>


        </table>


      </div>


    </div>

  );

}
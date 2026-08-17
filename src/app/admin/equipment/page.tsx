"use client";

import { useEffect, useState } from "react";


type Equipment = {
  id: string;
  name: string;
  dailyRate: number;
  category: string;
};


type QuoteItem = {
  category: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
};



export default function EquipmentPage() {


const [equipment,setEquipment] =
useState<Equipment[]>([]);


const [search,setSearch] =
useState("");


const [quoteItems,setQuoteItems] =
useState<QuoteItem[]>([]);



const [custom,setCustom] = useState({

category:"Creative",

description:"",

quantity:1,

rate:0

});




useEffect(()=>{

fetch("/api/equipment")
.then(res=>res.json())
.then(data=>setEquipment(data));

},[]);





function addEquipment(item:Equipment){


setQuoteItems(prev=>[

...prev,

{

category:"Equipment",

description:item.name,

quantity:1,

unit:"day",

rate:item.dailyRate,

amount:item.dailyRate

}

]);


}





function addCustomItem(){


setQuoteItems(prev=>[

...prev,

{

category:custom.category,

description:custom.description,

quantity:custom.quantity,

unit:"unit",

rate:custom.rate,

amount:
custom.quantity *
custom.rate

}

]);


setCustom({

category:"Creative",

description:"",

quantity:1,

rate:0

});


}






function removeItem(index:number){

setQuoteItems(
quoteItems.filter(
(_,i)=>i!==index
)
);

}




const total =
quoteItems.reduce(
(sum,item)=>
sum+item.amount,
0
);





async function saveQuote(){


const res =
await fetch("/api/quotes",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

title:"Production Quote",

items:quoteItems

})

});


const data =
await res.json();



if(data.success){

alert("Quote saved");

setQuoteItems([]);

}
else{

alert("Error saving quote");

}



}






const filtered =
equipment.filter(item=>

item.name
.toLowerCase()
.includes(
search.toLowerCase()
)

);





return (

<div className="p-8">


<h1 className="text-3xl font-bold mb-8">
Production Quote Builder
</h1>




<div className="grid md:grid-cols-2 gap-8">



{/* EQUIPMENT */}


<div>


<h2 className="text-xl font-bold mb-4">
Equipment
</h2>



<input

className="border p-3 w-full mb-4 rounded"

placeholder="Search equipment"

value={search}

onChange={
e=>setSearch(e.target.value)
}

/>



{filtered.map(item=>(


<div
key={item.id}
className="border p-4 rounded mb-3"
>


<strong>
{item.name}
</strong>


<p>
KES {item.dailyRate}/day
</p>



<button

className="bg-black text-white px-4 py-2 mt-2 rounded"

onClick={()=>
addEquipment(item)
}

>

Add

</button>


</div>


))}



</div>






{/* QUOTE BUILDER */}


<div>


<h2 className="text-xl font-bold mb-4">
Quote Items
</h2>





{
quoteItems.map(
(item,index)=>(


<div

key={index}

className="border p-3 rounded mb-3"

>


<div className="flex justify-between">

<div>

<strong>
{item.category}
</strong>

<p>
{item.description}
</p>

<p>
KES {item.amount}
</p>

</div>



<button

className="text-red-600"

onClick={()=>
removeItem(index)
}

>

X

</button>


</div>


</div>


))

}






<h2 className="font-bold text-xl mt-6">

Total:

KES {total}

</h2>







<hr className="my-8"/>





<h2 className="font-bold text-xl mb-4">

Add Production Cost

</h2>





<select

className="border p-2 w-full mb-3"

value={custom.category}

onChange={
e=>
setCustom({
...custom,
category:e.target.value
})
}

>


<option>
Creative
</option>

<option>
Crew
</option>

<option>
Post Production
</option>

<option>
Logistics
</option>

<option>
Accommodation
</option>

<option>
Transport
</option>

<option>
Catering
</option>

<option>
Other
</option>


</select>





<input

className="border p-2 w-full mb-3"

placeholder="Description"

value={custom.description}

onChange={
e=>
setCustom({
...custom,
description:e.target.value
})
}

/>





<input

className="border p-2 w-full mb-3"

type="number"

placeholder="Quantity"

value={custom.quantity}

onChange={
e=>
setCustom({
...custom,
quantity:Number(e.target.value)
})
}

/>





<input

className="border p-2 w-full mb-3"

type="number"

placeholder="Rate"

value={custom.rate}

onChange={
e=>
setCustom({
...custom,
rate:Number(e.target.value)
})
}

/>





<button

className="bg-blue-600 text-white px-5 py-3 rounded"

onClick={addCustomItem}

>

Add Cost

</button>






<button

className="block mt-8 bg-green-600 text-white px-6 py-3 rounded"

onClick={saveQuote}

>

Save Quote

</button>



</div>





</div>


</div>


);


}
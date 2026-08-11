"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";


interface Partner {

id:string;

full_name:string;

phone:string | null;

vehicle_type:string | null;

vehicle_number:string | null;

is_available:boolean | null;

rating:number | null;

total_deliveries:number | null;

}



export default function DeliveryPartnersPage(){


const [partners,setPartners] =
useState<Partner[]>([]);


const [loading,setLoading] =
useState(true);



useEffect(()=>{

loadPartners();

},[]);





async function loadPartners(){


const {data,error}=

await supabase
.from("delivery_partners")
.select(`
id,
full_name,
phone,
vehicle_type,
vehicle_number,
is_available,
rating,
total_deliveries
`)
.order(
"created_at",
{
ascending:false
}
);



console.log(
"PARTNERS:",
data
);


console.log(
"ERROR:",
error
);



setPartners(
data || []
);


setLoading(false);


}




if(loading){

return(

<div className="p-10 text-xl font-bold">

Loading Partners...

</div>

)

}





return(

<main className="min-h-screen bg-slate-100 p-10">


<h1 className="text-4xl font-bold mb-8">

🚚 Delivery Partners

</h1>




{
partners.length===0?


(

<div className="bg-white rounded-3xl p-8 shadow">

No Delivery Partners Found

</div>

)


:


(

<div className="grid md:grid-cols-2 gap-6">


{
partners.map((partner)=>(


<div

key={partner.id}

className="
bg-white
rounded-3xl
p-6
shadow
"

>


<h2 className="text-2xl font-bold">

{partner.full_name}

</h2>



<p className="mt-3">

📞 Phone:

<b>

{" "}
{partner.phone || "N/A"}

</b>

</p>




<p>

🏍 Vehicle:

<b>

{" "}
{partner.vehicle_type || "N/A"}

</b>

</p>




<p>

🔢 Number:

<b>

{" "}
{partner.vehicle_number || "N/A"}

</b>

</p>




<p>

⭐ Rating:

<b>

{" "}
{partner.rating || 0}

</b>

</p>




<p>

📦 Deliveries:

<b>

{" "}
{partner.total_deliveries || 0}

</b>

</p>





<p className="mt-4">


Status:


<span

className={`
ml-2
font-bold
${
partner.is_available
?
"text-green-600"
:
"text-red-600"
}
`}

>


{
partner.is_available
?
"Available"
:
"Busy"
}


</span>


</p>



</div>


))

}


</div>

)

}



</main>


)

}
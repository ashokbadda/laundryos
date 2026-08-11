"use client";

import { useEffect, useState } from "react";
import { getAddresses } from "@/lib/addresses/getAddresses";
import { createOrder } from "@/lib/orders/createOrder";


export default function BookingPage() {


const [date,setDate] = useState("");

const [time,setTime] = useState("");

const [instruction,setInstruction] = useState("");


const [addresses,setAddresses] = useState<any[]>([]);

const [selectedAddress,setSelectedAddress] = useState("");


const [cartTotal,setCartTotal] = useState(0);



const slots = [

"10 AM - 12 PM",

"12 PM - 2 PM",

"2 PM - 4 PM",

"4 PM - 6 PM"

];





useEffect(()=>{


async function loadAddresses(){

try{


const data = await getAddresses();

setAddresses(data || []);


}catch(error){

console.log(error);

}


}



function loadCartTotal(){


const cartData =
localStorage.getItem("laundry-cart");



if(cartData){


const cart =
JSON.parse(cartData);



const items =
cart.state?.items || [];



const total =
items.reduce(
(sum:any,item:any)=>
sum + item.price * item.quantity,
0
);



setCartTotal(total);


}



}



loadAddresses();

loadCartTotal();



},[]);







async function confirmPickup(){


if(!date){

alert("Please select pickup date");

return;

}



if(!time){

alert("Please select time slot");

return;

}



if(!selectedAddress){

alert("Please select pickup address");

return;

}



if(cartTotal===0){

alert("Cart is empty");

return;

}





try{


const order = await createOrder({

address_id:Number(selectedAddress),

pickup_date:date,

pickup_slot:time,

instructions:instruction,

total:cartTotal


});





window.location.href =

`/customer/order-success?id=${order.id}&date=${date}&slot=${time}&total=${cartTotal}`;




}

catch(error){


console.log(error);


alert("Failed to create order");


}



}






return (

<main className="min-h-screen bg-slate-100 p-6 md:p-10">


<div className="max-w-4xl mx-auto">



<h1 className="text-4xl font-bold mb-8">

Pickup Booking 🚚

</h1>





<div className="bg-white rounded-3xl p-6 shadow mb-6">


<h2 className="text-xl font-semibold mb-4">

📅 Select Pickup Date

</h2>


<input

type="date"

value={date}

onChange={(e)=>setDate(e.target.value)}

className="w-full border p-3 rounded-xl"

/>


</div>







<div className="bg-white rounded-3xl p-6 shadow mb-6">


<h2 className="text-xl font-semibold mb-4">

🕒 Select Time Slot

</h2>



<div className="grid md:grid-cols-2 gap-4">


{

slots.map((slot)=>(


<button

key={slot}

onClick={()=>setTime(slot)}

className={`p-4 rounded-2xl border ${
time===slot
?
"bg-blue-600 text-white"
:
"bg-white"
}`}

>


{slot}


</button>


))

}


</div>


</div>









<div className="bg-white rounded-3xl p-6 shadow mb-6">


<h2 className="text-xl font-semibold mb-4">

📍 Select Pickup Address

</h2>



{

addresses.length===0 ?

<p className="text-red-500">

No saved addresses found.

</p>


:

addresses.map((address)=>(


<div

key={address.id}

onClick={()=>setSelectedAddress(String(address.id))}

className={`cursor-pointer border rounded-3xl p-5 mb-4 ${
selectedAddress===String(address.id)
?
"border-blue-600 bg-blue-50"
:
""
}`}

>


<h3 className="font-bold">

{address.full_name}

</h3>


<p>

📍 {address.address_line}

</p>


<p>

{address.city}, {address.state}

</p>


<p>

India - {address.pincode}

</p>



</div>


))


}


</div>









<div className="bg-white rounded-3xl p-6 shadow mb-6">


<h2 className="text-xl font-semibold mb-3">

📝 Pickup Instructions

</h2>



<textarea

value={instruction}

onChange={(e)=>setInstruction(e.target.value)}

placeholder="Call before arrival"

className="w-full border rounded-xl p-3 h-32"

/>


</div>







<div className="bg-white rounded-3xl p-6 shadow mb-6">


<h2 className="text-2xl font-bold">

Total Amount: ₹{cartTotal}

</h2>


</div>







<button

onClick={confirmPickup}

className="
w-full
bg-blue-600
text-white
p-4
rounded-2xl
font-bold
text-lg
"

>


Confirm Pickup 🚚


</button>



</div>


</main>


);


}
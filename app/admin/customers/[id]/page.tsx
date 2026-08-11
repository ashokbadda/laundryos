"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";


export default function CustomerDetailsPage() {

  const router = useRouter();

  const params = useParams();


  const customerId = params?.id as string;



  const [customer,setCustomer] = useState<any>(null);

  const [orders,setOrders] = useState<any[]>([]);

  const [loading,setLoading] = useState(true);



  useEffect(()=>{


    console.log("PARAMS:",params);

    console.log("CUSTOMER ID:",customerId);



    async function loadCustomer(){


      if(!customerId){

        console.log("Missing Customer ID");

        setLoading(false);

        return;

      }



      const {data:customerData,error:customerError}=

      await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        email,
        phone
        `
      )
      .eq(
        "id",
        customerId
      )
      .single();



      console.log(
        "CUSTOMER:",
        customerData
      );


      console.log(
        "CUSTOMER ERROR:",
        customerError
      );





      const {data:orderData,error:orderError}=

      await supabase
      .from("orders")
      .select(
        `
        id,
        total,
        status,
        created_at
        `
      )
      .eq(
        "user_id",
        customerId
      )
      .order(
        "created_at",
        {
          ascending:false
        }
      );



      console.log(
        "ORDERS:",
        orderData
      );


      console.log(
        "ORDER ERROR:",
        orderError
      );



      setCustomer(customerData);

      setOrders(orderData || []);

      setLoading(false);


    }



    loadCustomer();


  },[customerId]);





  if(loading){

    return(
      <div className="p-10 text-xl font-bold">
        Loading Customer...
      </div>
    );

  }





  const totalSpent =
  orders.reduce(
    (sum,item)=>
    sum + Number(item.total || 0),
    0
  );





  return(

    <main className="min-h-screen bg-slate-100 p-10">


      <button
      onClick={()=>router.back()}
      className="
      mb-6
      rounded-xl
      bg-black
      px-5
      py-2
      text-white
      "
      >

        ← Back

      </button>





      <h1 className="text-4xl font-bold mb-8">
        Customer Details
      </h1>





      <div className="bg-white rounded-3xl p-6 shadow">


        <h2 className="text-2xl font-bold">

          {customer?.full_name || "Unknown"}

        </h2>


        <p className="mt-3">
          📧 {customer?.email || "No Email"}
        </p>


        <p>
          📞 {customer?.phone || "No Phone"}
        </p>


        <p className="mt-5 font-bold">
          💰 Lifetime Spending: ₹{totalSpent}
        </p>


      </div>






      <h2 className="text-2xl font-bold mt-8 mb-5">
        📦 Order History
      </h2>






      {
        orders.length === 0 ?

        (

          <div className="bg-white rounded-3xl p-6 shadow">

            No Orders Found

          </div>

        )

        :

        (

          <div className="space-y-5">


          {
            orders.map((order)=>(


              <div
              key={order.id}
              className="
              bg-white
              rounded-3xl
              p-6
              shadow
              "
              >


                <p>
                  Order ID:
                  <b> {order.id}</b>
                </p>


                <p>
                  Status:
                  <b> {order.status}</b>
                </p>


                <p>
                  Amount:
                  <b> ₹{order.total}</b>
                </p>


                <p>
                  Date:
                  {
                    order.created_at
                    ?
                    new Date(order.created_at)
                    .toLocaleDateString()
                    :
                    "N/A"
                  }
                </p>


              </div>


            ))
          }


          </div>

        )
      }



    </main>

  );

}
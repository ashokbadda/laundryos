"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

export default function OrderDetailsPage() {

  const params = useParams();

  const id = params.id;

  const [order, setOrder] = useState<any>(null);


  const statuses = [
    "Pending",
    "Confirmed",
    "Picked Up",
    "Washing",
    "Ready",
    "Delivered",
  ];



  useEffect(() => {

    async function getOrder() {


      const { data, error } = await supabase

        .from("orders")

        .select(`
          *,
          addresses (
            full_name,
            phone,
            address_line,
            city,
            state,
            pincode
          ),
          order_items (
            id,
            quantity,
            price,
            services (
              name
            )
          )
        `)

        .eq("id", id)

        .single();



      if (error) {

        console.log(error);

      } else {

        setOrder(data);

      }


    }


    getOrder();


  }, [id]);





  async function updateStatus(newStatus: string) {


    const { error } = await supabase

      .from("orders")

      .update({
        status: newStatus,
      })

      .eq("id", id);



    if (error) {

      console.log(error);

    } else {


      setOrder({

        ...order,

        status: newStatus,

      });


    }


  }




  if (!order) {


    return (

      <div className="p-10 text-xl font-semibold">

        Loading Order...

      </div>

    );


  }





  return (

    <main className="min-h-screen bg-slate-100 p-10">


      <h1 className="mb-8 text-4xl font-bold">

        📦 Order #{order.id}

      </h1>





      <div className="grid gap-6 lg:grid-cols-2">



        {/* Customer Details */}

        <div className="rounded-3xl bg-white p-8 shadow">


          <h2 className="mb-5 text-2xl font-bold">

            👤 Customer

          </h2>


          <p>

            Name:
            {" "}
            {order.addresses?.full_name || "Unknown"}

          </p>


          <p className="mt-2">

            Phone:
            {" "}
            {order.addresses?.phone || "Not available"}

          </p>


        </div>





        {/* Pickup Address */}

        <div className="rounded-3xl bg-white p-8 shadow">


          <h2 className="mb-5 text-2xl font-bold">

            📍 Pickup Address

          </h2>


          <p>

            {order.addresses?.address_line}

          </p>


          <p>

            {order.addresses?.city}

            {" - "}

            {order.addresses?.pincode}

          </p>


          <p>

            {order.addresses?.state}

          </p>


        </div>


      </div>






      {/* Order Information */}

      <div className="mt-6 rounded-3xl bg-white p-8 shadow">


        <h2 className="mb-5 text-2xl font-bold">

          🧾 Order Information

        </h2>



        <p>

          Pickup Date:
          {" "}
          {order.pickup_date}

        </p>



        <p>

          Pickup Slot:
          {" "}
          {order.pickup_slot}

        </p>



        <p className="mt-2 text-lg font-bold">

          Total:
          {" "}
          ₹{order.total}

        </p>


      </div>






      {/* Laundry Services */}

      <div className="mt-6 rounded-3xl bg-white p-8 shadow">


        <h2 className="mb-5 text-2xl font-bold">

          🧺 Laundry Services

        </h2>



        {

          order.order_items?.length === 0 ? (

            <p>

              No services found

            </p>


          ) : (


            order.order_items?.map((item:any)=>(


              <div

                key={item.id}

                className="
                flex
                justify-between
                border-b
                py-3
                ">


                <span>

                  {item.services?.name || "Service"}

                </span>



                <span>

                  Qty:
                  {" "}
                  {item.quantity}

                </span>



                <span>

                  ₹{item.price}

                </span>



              </div>


            ))


          )

        }



      </div>







      {/* Payment */}

      <div className="mt-6 rounded-3xl bg-white p-8 shadow">


        <h2 className="mb-5 text-2xl font-bold">

          💳 Payment

        </h2>


        <p>

          Amount:
          {" "}
          ₹{order.total}

        </p>


        <p className="mt-2">

          Payment Status:
          {" "}
          {order.payment_status || "Pending"}

        </p>


      </div>







      {/* Status Update */}

      <div className="mt-6 rounded-3xl bg-white p-8 shadow">


        <h2 className="mb-5 text-2xl font-bold">

          🚚 Update Order Status

        </h2>



        <div className="flex flex-wrap gap-3">


          {

            statuses.map((status)=>(


              <button

                key={status}

                onClick={()=>updateStatus(status)}

                className={`
                  rounded-xl
                  px-5
                  py-3
                  font-semibold
                  ${
                    order.status === status
                    ?
                    "bg-blue-600 text-white"
                    :
                    "bg-slate-200"
                  }
                `}

              >

                {status}

              </button>


            ))

          }


        </div>



      </div>




    </main>

  );


}
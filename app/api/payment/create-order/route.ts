import { NextResponse } from "next/server";
import Razorpay from "razorpay";


const razorpay = new Razorpay({

  key_id: process.env.RAZORPAY_KEY_ID!,

  key_secret: process.env.RAZORPAY_KEY_SECRET!,

});


// Check Razorpay key loading
console.log(
  "RAZORPAY KEY:",
  process.env.RAZORPAY_KEY_ID
);



export async function POST(request: Request) {


  try {


    const body = await request.json();


    const {
      amount,
      orderId
    } = body;



    if (!amount || !orderId) {


      return NextResponse.json(

        {
          success:false,
          error:"Amount and Order ID required"
        },

        {
          status:400
        }

      );


    }





    const razorpayOrder = await razorpay.orders.create({


      amount: Number(amount) * 100,


      currency:"INR",


      receipt:`laundry_order_${orderId}`


    });





    return NextResponse.json({


      success:true,


      razorpayOrder


    });



  }


  catch(error:any){


    console.log(

      "Razorpay Error:",

      error

    );



    return NextResponse.json(


      {

        success:false,

        error:error.message

      },


      {

        status:500

      }


    );


  }


}
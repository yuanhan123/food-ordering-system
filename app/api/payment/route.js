
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  let data = await request.json();
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: 'sgd',
      description: "Payment for Order",
      payment_method: data.id,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Disable automatic redirection,
      }
    });
    // console.log("data", data);

    // Check if the payment was successful
    if (paymentIntent.status === "succeeded") {
      console.log("Payment was successful");
      console.log("Payment ID:", paymentIntent.id);
      return NextResponse.json(
        {
          message: "Payment was successful",
          success: true
        },
        {
          status: 200
        }
      );
    } else {
      console.log("Payment Status:", paymentIntent.status);
      return NextResponse.json(
        {
          message: "Payment Failed",
          success: false
        },
        {
          status: 200
        }
      );
    }

  } catch (err) {
    console.log("Error", err);
    return NextResponse.json(
      {
        message: err.message,
        success: false
      },
      {
        status: 400
      }
    );
  }
}
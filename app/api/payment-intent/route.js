import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  let data = await request.json();
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount * 100, // in cents
      currency: 'sgd',
      description: "Payment for Order",
      // payment_method: data.id,
      // confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Disable automatic redirection,
      }
    });
    console.log("data", data);
    return NextResponse.json(
      {
        success: true,
        clientSecret: paymentIntent.client_secret
      },
      {
        status: 200
      }
    );
  }
  catch (err) {
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
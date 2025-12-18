import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20", 
  typescript: true,
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { products, restaurantId, deliveryFee, deliveryAddress } = await req.json();

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = products.map((product: any) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: product.name,
        },
        unit_amount: Math.round(Number(product.price) * 100), 
      },
      quantity: product.quantity,
    }));

    if (deliveryFee && Number(deliveryFee) > 0) {
      line_items.push({
        price_data: {
          currency: "brl",
          product_data: {
            name: "Taxa de Entrega",
          },
          unit_amount: Math.round(Number(deliveryFee) * 100),
        },
        quantity: 1,
      });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: process.env.NEXT_PUBLIC_APP_URL + "/order/success",
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + "/checkout",
      metadata: {
        userId: session.user.id,
        restaurantId: restaurantId,
        deliveryAddress: typeof deliveryAddress === 'string' ? deliveryAddress : JSON.stringify(deliveryAddress),
      },
      line_items: line_items,
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    return new NextResponse("Erro interno no servidor de pagamento", { status: 500 });
  }
}
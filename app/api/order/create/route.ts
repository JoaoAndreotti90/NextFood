import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { products, restaurantId, deliveryAddress, total, userId } = body;

    if (!userId) {
       return NextResponse.json({ error: "Erro: Usuário não identificado" }, { status: 400 });
    }

    const order = await db.order.create({
      data: {
        total: Number(total),
        status: "PENDING",
        consumptionMethod: "DELIVERY",
        deliveryAddress,
        restaurantId,
        userId, 
        products: {
          create: products.map((product: { id: string; quantity: number; price: number }) => ({
            productId: product.id,
            quantity: product.quantity,
            price: product.price
          }))
        }
      }
    });

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao processar pedido" }, { status: 500 });
  }
}
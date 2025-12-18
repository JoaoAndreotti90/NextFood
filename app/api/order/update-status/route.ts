import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
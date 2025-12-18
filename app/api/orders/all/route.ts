import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        user: true,
        products: {
            include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
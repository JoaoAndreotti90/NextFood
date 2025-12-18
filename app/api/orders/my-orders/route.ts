import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Usuário obrigatório" }, { status: 400 });
    }

    const orders = await db.order.findMany({
      where: { userId: userId },
      include: {
        restaurant: true,
        products: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }
}
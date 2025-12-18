import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json([], { status: 400 });

    const addresses = await db.userAddress.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, label, street, number, neighborhood, complement } = body;

    if (!userId || !street || !number) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const newAddress = await db.userAddress.create({
      data: {
        userId,
        label,
        street,
        number,
        neighborhood,
        complement
      }
    });

    return NextResponse.json(newAddress);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
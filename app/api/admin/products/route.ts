import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { restaurant: true }
    });

    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!user.restaurant) {
        return NextResponse.json({ error: "Restaurante não encontrado" }, { status: 404 });
    }

    try {
        const body = await req.json();
        const { name, description, price, categoryId, imageUrl } = body;

        if (!name || !price || !categoryId) {
            return NextResponse.json({ error: "Preencha todos os campos obrigatórios" }, { status: 400 });
        }

        const product = await db.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                imageUrl: imageUrl,
                categoryId,
                restaurantId: user.restaurant.id
            }
        });

        return NextResponse.json({ success: true, product }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const { name, deliveryTime, deliveryFee, imageUrl, categories } = body;

        if (!name || !deliveryTime || !deliveryFee) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        const existingRestaurant = await db.restaurant.findUnique({
            where: { adminId: session.user.id }
        });

        if (existingRestaurant) {
            return NextResponse.json({ error: "Você já possui uma loja." }, { status: 409 });
        }

        const restaurant = await db.restaurant.create({
            data: {
                name,
                imageUrl,
                deliveryTimeMinutes: Number(deliveryTime),
                deliveryFee: Number(deliveryFee),
                adminId: session.user.id,
                categories: {
                    connect: categories?.map((id: string) => ({ id })) || []
                }
            }
        });

        await db.user.update({
            where: { id: session.user.id },
            data: { role: 'ADMIN' }
        });

        return NextResponse.json({ success: true, restaurantId: restaurant.id });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao criar loja" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json(null, { status: 401 });

        const restaurant = await db.restaurant.findUnique({
            where: { adminId: session.user.id },
            include: { categories: true }
        });

        const user = await db.user.findUnique({
            where: { id: session.user.id }
        });

        return NextResponse.json({
            ...restaurant,
            address: user?.address || "",
            addressNumber: user?.addressNumber || "",
            neighborhood: user?.neighborhood || "",
            cpf: user?.cpf || ""
        });
    } catch (error) {
        return NextResponse.json(null, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

        const body = await req.json();
        
        const { 
            name, 
            deliveryTime, 
            deliveryFee, 
            imageUrl, 
            categories, 
            address, 
            addressNumber, 
            neighborhood 
        } = body;

        const restaurant = await db.restaurant.update({
            where: { adminId: session.user.id },
            data: {
                name,
                imageUrl,
                deliveryTimeMinutes: Number(deliveryTime),
                deliveryFee: Number(deliveryFee),
                categories: {
                    set: [], 
                    connect: categories?.map((id: string) => ({ id })) || []
                }
            }
        });

        await db.user.update({
            where: { id: session.user.id },
            data: { 
                address, 
                addressNumber, 
                neighborhood 
            }
        });

        return NextResponse.json({ success: true, restaurant });
    } catch (error) {
        console.error("Erro PATCH:", error);
        return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
    }
}
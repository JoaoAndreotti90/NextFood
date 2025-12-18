import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session) return NextResponse.json({}, { status: 401 });

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    try {
        const order = await db.order.update({
            where: { id },
            data: { status: body.status }
        });

        return NextResponse.json({
            ...order,
            total: Number(order.total) 
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
    }
}
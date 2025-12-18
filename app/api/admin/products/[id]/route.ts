import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function checkAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return null;

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user || user.role !== 'ADMIN') return null;
    
    return user;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;

    const product = await db.product.findUnique({
        where: { id }
    });

    if (!product) {
         return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    try {
        const product = await db.product.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                price: parseFloat(body.price),
                categoryId: body.categoryId,
                ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}) 
            }
        });
        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;

    try {
        await db.product.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
    }
}
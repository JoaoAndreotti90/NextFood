import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
    try {
        await db.category.createMany({
            data: [
                { name: "Lanches", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200" },
                { name: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200" },
                { name: "Japonesa", imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200" },
                { name: "Brasileira", imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=200" },
                { name: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=200" },
                { name: "Sobremesas", imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=200" },
            ],
            skipDuplicates: true,
        });
        return NextResponse.json({ message: "Categorias criadas com sucesso!" });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao criar categorias" }, { status: 500 });
    }
}
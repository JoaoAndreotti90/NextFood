import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await db.category.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session) return NextResponse.json(null, { status: 401 });

    const restaurant = await db.restaurant.findUnique({
        where: { adminId: session.user.id },
        include: {
            categories: true 
        }
    });

    return NextResponse.json(restaurant);
}
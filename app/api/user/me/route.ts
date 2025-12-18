import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return new NextResponse("Não autorizado", { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id }
        })

        return NextResponse.json(user)
    } catch (error) {
        return new NextResponse("Erro ao buscar dados", { status: 500 })
    }
}
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function DELETE(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

        await db.user.delete({
            where: { id: session.user.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao excluir conta" }, { status: 500 });
    }
}
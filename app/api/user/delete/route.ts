import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function DELETE(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
        }

        await db.$transaction([
            db.orderProduct.deleteMany({
                where: { order: { userId: userId } },
            }),
            db.order.deleteMany({
                where: { userId: userId },
            }),
            db.userAddress.deleteMany({
                where: { userId: userId },
            }),
            db.session.deleteMany({
                where: { userId: userId },
            }),
            db.account.deleteMany({
                where: { userId: userId },
            }),
            db.user.delete({
                where: { id: userId },
            }),
        ]);

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Erro interno ao tentar excluir a conta." }, { status: 500 });
    }
}
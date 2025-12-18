import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    try {
        const { cpf, phone, address, addressNumber, neighborhood, role } = await req.json();

        const dataToUpdate: any = {};
        if (cpf) dataToUpdate.cpf = cpf;
        if (phone) dataToUpdate.phone = phone;
        if (address) dataToUpdate.address = address;
        if (addressNumber) dataToUpdate.addressNumber = addressNumber;
        if (neighborhood) dataToUpdate.neighborhood = neighborhood;
        
        if (role === 'ADMIN' || role === 'USER') {
            dataToUpdate.role = role;
        }
        
        const updatedUser = await db.user.update({
            where: { id: session.user.id },
            data: dataToUpdate,
        });

        return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });

    } catch (error: any) {
        console.error("Erro ao atualizar:", error);
        if (error.code === 'P2002') {
             return NextResponse.json({ error: "CPF/CNPJ já cadastrado." }, { status: 409 });
        }
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}
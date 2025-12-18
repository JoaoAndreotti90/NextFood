import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
        }
        
        if (role !== Role.USER && role !== Role.ADMIN) {
            return NextResponse.json({ error: "Cargo inválido." }, { status: 400 });
        }

        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                name,
                email,
                role: role,
                accounts: {
                    create: {
                        providerId: 'credentials',
                        accountId: email,
                        password: hashedPassword,
                    },
                },
                emailVerified: true,
            },
        });

        return NextResponse.json({ success: true, userId: newUser.id }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
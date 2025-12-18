import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST() {
    try {
        await auth.api.signOut({
            headers: await headers()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao sair" }, { status: 500 });
    }
}
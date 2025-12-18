"use client"

import { useSession, signOut } from "@/lib/auth-client"
import Link from "next/link"
import { Loader2, User, LogOut, Settings } from "lucide-react"
import { useState } from "react"

export default function UserHeader() {
    const { data: session, isPending } = useSession()
    const [isOpen, setIsOpen] = useState(false)

    if (isPending) return <Loader2 className="h-5 w-5 text-white/50 animate-spin" />

    if (!session) {
        return (
            <Link 
                href="/auth/login" 
                className="bg-white text-orange-600 px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:bg-orange-50 hover:shadow-lg shadow-sm"
            >
                Entrar
            </Link>
        )
    }

    const firstName = session.user.name.split(" ")[0]

    return (
        <div className="relative">
            <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full transition-all border border-white/20"
            >
                <div className="bg-orange-500 p-1 rounded-full text-white">
                    <User size={14} />
                </div>
                <span className="text-sm font-semibold">Olá, {firstName}</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl py-2 border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Logado como</p>
                            <p className="text-sm font-bold text-gray-800 truncate mt-1">{session.user.email}</p>
                        </div>

                        <div className="p-2">
                            <Link 
                                href="/my-account" 
                                onClick={() => setIsOpen(false)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl flex items-center gap-3 font-medium transition-colors"
                            >
                                <Settings size={18} /> Meus Dados
                            </Link>

                            <button 
                                type="button"
                                onClick={() => signOut()}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 font-medium transition-colors mt-1"
                            >
                                <LogOut size={18} /> Sair da conta
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
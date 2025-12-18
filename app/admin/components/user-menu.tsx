"use client"

import { useState, useRef, useEffect } from "react"
import { LogOut, ChevronDown, Store } from "lucide-react"
import Link from "next/link"

interface UserMenuProps {
    name: string
}

export default function UserMenu({ name }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST"
            })
            window.location.href = "/"
        } catch (error) {
            console.error("Erro ao sair")
        }
    }

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all border ${
                    isOpen ? 'bg-white border-orange-200 shadow-md ring-2 ring-orange-100' : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-gray-50'
                }`}
            >
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-xs">
                    {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-xs font-bold text-gray-700 leading-none">Olá, {name}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-xs font-bold text-gray-500 uppercase">Minha Conta</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{name}</p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                        <Link 
                            href="/admin/settings" 
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                        >
                            <Store size={18} /> Dados da Loja
                        </Link>
                        
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut size={18} /> Sair do Sistema
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
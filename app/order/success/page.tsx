"use client"

import { CheckCircle } from "lucide-react"
import { useEffect } from "react"
import { useCart } from "@/app/context/cart"
import { useRouter } from "next/navigation"

export default function SuccessPage() {
    const { clearCart } = useCart()
    const router = useRouter()

    useEffect(() => {
        clearCart()
    }, []) 

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl max-w-sm w-full flex flex-col items-center animate-in fade-in zoom-in duration-500 border border-gray-100">
                <div className="h-28 w-28 bg-green-50 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" strokeWidth={3} />
                    </div>
                </div>
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Tudo Certo!</h1>
                <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                    Seu pedido foi recebido pelo restaurante e já vai começar a ser preparado.
                </p>
                
                <button 
                    onClick={() => router.push("/")}
                    className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 active:scale-95 transition-all shadow-lg shadow-orange-200"
                >
                    Voltar para o Início
                </button>
            </div>
        </div>
    )
}
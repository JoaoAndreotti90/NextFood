"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth-client"
import { Loader2, Mail, Lock, User, ArrowRight, ChevronLeft } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!name || !email || !password) {
            toast.warning("Preencha todos os campos")
            return
        }

        if (password.length < 8) {
            toast.warning("A senha deve ter no mínimo 8 caracteres")
            return
        }

        await signUp.email({
            email,
            password,
            name,
            callbackURL: "/" 
        }, {
            onRequest: () => {
                setLoading(true)
            },
            onSuccess: () => {
                toast.success("Conta criada com sucesso!")
                router.push("/")
            },
            onError: (ctx) => {
                setLoading(false)
                
                const msg = ctx.error.message || ""
                
                if (
                    msg.includes("User already exists") || 
                    msg.includes("already") || 
                    ctx.error.status === 422
                ) {
                    toast.error("Este e-mail já está cadastrado. Tente fazer login.")
                } else {
                    toast.error("Erro ao criar conta. Tente novamente.")
                }
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
                
                <div className="p-8 pb-0 text-center relative">
                    <button 
                        onClick={() => router.push("/auth/login")}
                        className="absolute top-8 left-8 text-gray-400 hover:text-orange-600 transition-colors"
                    >
                        <ChevronLeft />
                    </button>
                    <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                        <User size={32} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-800">Crie sua conta</h1>
                    <p className="text-gray-500 text-sm mt-2">Comece a pedir agora mesmo!</p>
                </div>

                <form onSubmit={handleRegister} className="p-8 space-y-5">
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-3">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-3">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemplo@email.com"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-3">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Cadastrar"} 
                        {!loading && <ArrowRight size={20} />}
                    </button>

                </form>

                <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                        Já tem uma conta?{' '}
                        <Link href="/auth/login" className="text-orange-600 font-bold hover:underline">
                            Fazer Login
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}
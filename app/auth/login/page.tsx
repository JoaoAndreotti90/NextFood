"use client"

import { useState } from "react"
import { signIn } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import BackButton from "../../components/back-button"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleGoogleLogin = async () => {
        setLoading(true)
        await signIn.social({
            provider: "google",
            callbackURL: "/" 
        })
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email || !password) {
            toast.warning("Preencha e-mail e senha")
            return
        }

        await signIn.email({
            email,
            password,
            callbackURL: "/" 
        }, {
            onRequest: () => {
                setLoading(true)
            },
            onSuccess: () => {
                toast.success("Login realizado com sucesso!")
                router.push("/")
            },
            onError: (ctx) => {
                setLoading(false)
                if (ctx.error.status === 401 || ctx.error.message?.includes("Invalid")) {
                    toast.error("E-mail ou senha incorretos")
                } else {
                    toast.error("Erro ao entrar. Verifique seus dados.")
                }
            }
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative">
            <div className="absolute top-6 left-6">
                <BackButton />
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 w-full max-w-md text-center">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Bem-vindo</h1>
                    <p className="text-gray-500 font-medium">Faça login para matar sua fome.</p>
                </div>

                <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all mb-6 group"
                >
                    {loading ? (
                        <Loader2 className="animate-spin text-orange-600" />
                    ) : (
                        <Image 
                            src="https://www.svgrepo.com/show/475656/google-color.svg" 
                            alt="Google Logo" 
                            width={24} 
                            height={24}
                            className="group-hover:scale-110 transition-transform" 
                        />
                    )}
                    <span>Continuar com Google</span>
                </button>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                        <span className="px-4 bg-white text-gray-400">ou</span>
                    </div>
                </div>

                <form className="space-y-5" onSubmit={handleEmailLogin}>
                    <div className="text-left">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium bg-gray-50/50 focus:bg-white" 
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div className="text-left">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Senha</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium bg-gray-50/50 focus:bg-white" 
                            placeholder="******"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 active:scale-[0.98] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Entrar"}
                    </button>
                </form>

                <p className="mt-8 text-sm text-gray-500 font-medium">
                    Não tem uma conta? <Link href="/auth/register" className="text-orange-600 font-bold hover:underline">Cadastre-se</Link>
                </p>
            </div>
        </div>
    )
}
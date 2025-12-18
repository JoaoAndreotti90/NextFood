"use client"

import { createContext, useContext, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter, usePathname } from "next/navigation"

const AuthContext = createContext({})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (isPending) return

        if (session?.user) {
            const userPhone = (session.user as any).phone
            
            const temTelefone = userPhone && userPhone.length > 0
            const estaNaPaginaCadastro = pathname.includes("/auth/complete-profile")

            if (!temTelefone && !estaNaPaginaCadastro) {
                console.log("NextFood: Usuário sem telefone. Redirecionando...")
                router.push("/auth/complete-profile")
            }
        }
    }, [session, isPending, pathname, router])

    return (
        <AuthContext.Provider value={{ session, isPending }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext)
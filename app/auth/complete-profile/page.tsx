"use client"

import { useState } from "react"
import { useSession } from "@/lib/auth-client"
import { Loader2, MapPin, Phone, CreditCard, Store, User, ChevronLeft, Check } from "lucide-react"
import { toast } from "sonner"

export default function CompleteProfilePage() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    
    const [formData, setFormData] = useState({
        role: "USER",
        cpf: "",
        phone: "",
        address: "",
        addressNumber: "",
        neighborhood: ""
    })

    const handleRoleSelect = (role: string) => {
        setFormData({ ...formData, role })
        setStep(2)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/user/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Perfil atualizado! Redirecionando...")
                
                await new Promise(resolve => setTimeout(resolve, 500))

                if (formData.role === 'ADMIN') {
                    window.location.href = "/admin/new"
                } else {
                    window.location.href = "/"
                }
            } else {
                toast.error("Erro ao salvar dados.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro de conexão.")
        } finally {
            setLoading(false)
        }
    }

    if (!session) return null

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white max-w-2xl w-full rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-orange-600 p-10 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold text-white mb-2">Quase lá, {session.user.name.split(" ")[0]}!</h1>
                        <p className="text-orange-100 font-medium">Vamos personalizar sua experiência.</p>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 rotate-12 scale-150 transform origin-top-right pointer-events-none" />
                </div>

                <div className="p-10">
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-gray-800">Como você vai usar o app?</h2>
                                <p className="text-gray-500 text-sm">Selecione seu perfil para continuar</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <button 
                                    onClick={() => handleRoleSelect("USER")}
                                    className="group p-6 border-2 border-gray-100 rounded-3xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left relative overflow-hidden"
                                >
                                    <div className="h-14 w-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors shadow-sm">
                                        <User size={28} />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-orange-700">Quero Pedir</h3>
                                    <p className="text-sm text-gray-500 mt-1 font-medium group-hover:text-orange-600/70">Vou fazer pedidos nos restaurantes.</p>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-orange-600">
                                        <Check size={20} />
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleRoleSelect("ADMIN")}
                                    className="group p-6 border-2 border-gray-100 rounded-3xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left relative overflow-hidden"
                                >
                                    <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                                        <Store size={28} />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700">Tenho Restaurante</h3>
                                    <p className="text-sm text-gray-500 mt-1 font-medium group-hover:text-blue-600/70">Quero cadastrar minha loja e vender.</p>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                                        <Check size={20} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-3 mb-4">
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)} 
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Complete seus dados</h2>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide text-orange-600">Perfil {formData.role === 'USER' ? 'Cliente' : 'Empresa'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">
                                        {formData.role === 'ADMIN' ? 'CNPJ' : 'CPF'}
                                    </label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-3.5 text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
                                        <input 
                                            name="cpf" 
                                            onChange={handleChange} 
                                            required 
                                            placeholder={formData.role === 'ADMIN' ? "00.000.000/0001-00" : "000.000.000-00"}
                                            className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium bg-gray-50/50 focus:bg-white" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Celular</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-3.5 text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
                                        <input 
                                            name="phone" 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="(00) 00000-0000" 
                                            className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium bg-gray-50/50 focus:bg-white" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block ml-1">Endereço Principal</label>
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-3.5 text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
                                        <input 
                                            name="address" 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="Rua / Avenida" 
                                            className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium bg-gray-50/50 focus:bg-white" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input 
                                            name="addressNumber" 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="Número" 
                                            className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium bg-gray-50/50 focus:bg-white" 
                                        />
                                        <input 
                                            name="neighborhood" 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="Bairro" 
                                            className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium bg-gray-50/50 focus:bg-white" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 active:scale-[0.98] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Finalizar Cadastro"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
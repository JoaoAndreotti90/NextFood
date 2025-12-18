"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession, signOut } from "@/lib/auth-client" 
import { Loader2, ArrowLeft, Save, UploadCloud, Store, Clock, Bike, Image as ImageIcon, Trash2, AlertTriangle, Check, MapPin, FileText } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface Category {
    id: string
    name: string
}

export default function AdminSettingsPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [preview, setPreview] = useState<string | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    
    const [allCategories, setAllCategories] = useState<Category[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    const [formData, setFormData] = useState({
        name: "",
        deliveryTime: "",
        deliveryFee: "",
        imageUrl: "",
        address: "",
        addressNumber: "",
        neighborhood: "",
        cpf: ""
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                const catRes = await fetch("/api/categories")
                const categories = await catRes.json()
                setAllCategories(categories)

                const restRes = await fetch("/api/admin/restaurant/me")
                const data = await restRes.json()

                if (data || session?.user) {
                    const userData = session?.user as any || {}
                    
                    setFormData({
                        name: data?.name || (userData.name ? `Restaurante de ${userData.name}` : ""),
                        deliveryTime: data?.deliveryTimeMinutes?.toString() || "30",
                        deliveryFee: data?.deliveryFee?.toString() || "5",
                        imageUrl: data?.imageUrl || "",
                        address: data?.address || userData.address || "",
                        addressNumber: data?.addressNumber || userData.addressNumber || "",
                        neighborhood: data?.neighborhood || userData.neighborhood || "",
                        cpf: data?.cpf || userData.cpf || ""
                    })

                    if (data?.imageUrl) setPreview(data.imageUrl)
                    
                    if (data?.categories) {
                        setSelectedCategories(data.categories.map((c: any) => c.id))
                    }
                }
            } catch (error) {
                console.error(error)
                toast.error("Erro ao carregar dados")
            } finally {
                setFetching(false)
            }
        }

        if (session) {
            loadData()
        }
    }, [session])

    const toggleCategory = (id: string) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(c => c !== id))
        } else {
            setSelectedCategories([...selectedCategories, id])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                setPreview(base64String)
                setFormData({ ...formData, imageUrl: base64String })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/admin/restaurant", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    categories: selectedCategories
                })
            })

            if (res.ok) {
                toast.success("Loja atualizada com sucesso!")
                router.refresh()
            } else {
                toast.error("Erro ao atualizar loja.")
            }
        } catch (error) {
            toast.error("Erro de conexão.")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteRestaurant = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/restaurant/delete", {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success("Restaurante excluído com sucesso.")
                await signOut() 
                window.location.href = "/" 
            } else {
                toast.error("Erro ao excluir restaurante.")
            }
        } catch (error) {
            toast.error("Erro de conexão.")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600 h-10 w-10" /></div>

    return (
        <div className="min-h-screen bg-gray-50 p-6 relative">
            
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 p-1">
                        <div className="p-6 text-center">
                            <div className="mx-auto bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                                <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="text-red-600 h-7 w-7" />
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Excluir Restaurante?</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium leading-relaxed">
                                Esta ação apagará permanentemente sua loja, produtos e histórico de pedidos. Não pode ser desfeita.
                            </p>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={loading}
                                    className="flex-1 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleDeleteRestaurant}
                                    disabled={loading}
                                    className="flex-1 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sim, Excluir"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link 
                        href="/admin" 
                        className="p-3 bg-white rounded-full hover:bg-gray-100 transition-all border border-gray-200 shadow-sm hover:scale-105"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Configurações da Loja</h1>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block ml-1">Identidade Visual</label>
                            <div className="relative w-full h-56 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group bg-gray-50 hover:border-orange-300 transition-all">
                                {preview ? (
                                    <Image src={preview} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                                        <div className="bg-white p-3 rounded-full shadow-sm">
                                            <ImageIcon size={24} className="text-gray-300" />
                                        </div>
                                        <span className="text-sm font-medium">Toque para alterar a capa</span>
                                    </div>
                                )}
                                
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                
                                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold shadow-lg pointer-events-none text-gray-800 flex items-center gap-2 transform group-hover:scale-105 transition-transform">
                                    <UploadCloud size={18} className="text-orange-600" /> Editar Capa
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Nome do Restaurante</label>
                                <div className="relative group">
                                    <Store className="absolute left-4 top-3.5 text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
                                    <input 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="disabled text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">CNPJ</label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-3.5 text-gray-400 h-5 w-5 transition-colors" />
                                    <input 
                                        name="cpf" 
                                        value={formData.cpf} 
                                        disabled
                                        placeholder="00.000.000/0001-00"
                                        className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none font-medium text-gray-500 bg-gray-100 cursor-not-allowed" 
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Tempo (min)</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-3.5 text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
                                        <input 
                                            name="deliveryTime" 
                                            value={formData.deliveryTime} 
                                            onChange={handleChange} 
                                            className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Taxa (R$)</label>
                                    <div className="relative group">
                                        <Bike className="absolute left-4 top-3.5 text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
                                        <input 
                                            name="deliveryFee" 
                                            value={formData.deliveryFee} 
                                            onChange={handleChange} 
                                            className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100 mt-6">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block ml-1 mt-4">Endereço da Loja</label>
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-3.5 text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
                                        <input 
                                            name="address" 
                                            value={formData.address}
                                            onChange={handleChange} 
                                            required 
                                            placeholder="Rua / Avenida" 
                                            className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input 
                                            name="addressNumber" 
                                            value={formData.addressNumber}
                                            onChange={handleChange} 
                                            required 
                                            placeholder="Número" 
                                            className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700" 
                                        />
                                        <input 
                                            name="neighborhood" 
                                            value={formData.neighborhood}
                                            onChange={handleChange} 
                                            required 
                                            placeholder="Bairro" 
                                            className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Categorias (O que você vende?)</label>
                            <div className="flex flex-wrap gap-2">
                                {allCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                                            selectedCategories.includes(cat.id)
                                            ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-orange-300"
                                        }`}
                                    >
                                        {cat.name}
                                        {selectedCategories.includes(cat.id) && <Check size={12} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 active:scale-[0.98] transition-all flex justify-center gap-2 shadow-lg shadow-orange-600/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Salvar Alterações</>}
                        </button>
                    </form>
                </div>

                <div className="pt-4 pb-8 border-t border-gray-200">
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 text-red-500 bg-red-50 px-6 py-4 rounded-2xl font-bold hover:bg-red-100 hover:text-red-600 transition-all w-full justify-center border border-red-100 shadow-sm"
                    >
                        <Trash2 size={18} /> Excluir Restaurante
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                        Zona de Perigo: Esta ação é irreversível.
                    </p>
                </div>
            </div>
        </div>
    )
}
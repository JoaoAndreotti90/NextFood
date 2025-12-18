"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Store, Clock, Bike, Loader2, Image as ImageIcon, Check } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface Category {
    id: string
    name: string
    imageUrl: string
}

export default function NewRestaurantPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    
    const [allCategories, setAllCategories] = useState<Category[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    const [formData, setFormData] = useState({
        name: "",
        deliveryTime: "30",
        deliveryFee: "5.00",
        imageUrl: ""
    })

    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => setAllCategories(data))
            .catch(() => toast.error("Erro ao carregar categorias"))
    }, [])

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
        if (selectedCategories.length === 0) {
            toast.warning("Selecione pelo menos uma categoria!")
            return
        }
        
        setLoading(true)

        try {
            const res = await fetch("/api/admin/restaurant/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    categories: selectedCategories
                })
            })

            if (res.ok) {
                toast.success("Loja criada com sucesso!")
                router.push("/admin")
            } else {
                toast.error("Erro ao criar loja.")
            }
        } catch (error) {
            toast.error("Erro de conexão.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white max-w-lg w-full rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-orange-600 p-8 text-center">
                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Store className="text-white h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white mb-1">Configure sua Loja</h1>
                    <p className="text-orange-100 text-sm font-medium">Vamos começar a vender!</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Capa da Loja</label>
                        <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group bg-gray-50 hover:border-orange-400 transition-all cursor-pointer">
                            {preview ? (
                                <Image src={preview} alt="Preview" fill className="object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                                    <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                        <ImageIcon size={24} className="text-gray-300 group-hover:text-orange-500" />
                                    </div>
                                    <span className="text-xs font-bold group-hover:text-orange-600">Toque para adicionar foto</span>
                                </div>
                            )}
                            
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                required={!preview} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Nome do Restaurante</label>
                        <div className="relative group">
                            <Store className="absolute left-4 top-3.5 text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
                            <input 
                                name="name" 
                                onChange={handleChange} 
                                required 
                                placeholder="Ex: Burger King da Esquina" 
                                className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium bg-gray-50/50 focus:bg-white" 
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
                                    required 
                                    type="number"
                                    className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium bg-gray-50/50 focus:bg-white" 
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
                                    required 
                                    type="number"
                                    step="0.01"
                                    className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium bg-gray-50/50 focus:bg-white" 
                                />
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
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 active:scale-[0.98] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Criar Loja"}
                    </button>
                </form>
            </div>
        </div>
    )
}
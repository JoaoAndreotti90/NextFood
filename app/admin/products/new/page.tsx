"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft, Save, UploadCloud, DollarSign, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface Category {
    id: string
    name: string
}

export default function NewProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [preview, setPreview] = useState<string | null>(null)
    
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        imageUrl: "" 
    })

    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => toast.error("Erro ao carregar categorias"))
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    const removeImage = () => {
        setPreview(null)
        setFormData({ ...formData, imageUrl: "" })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Produto criado com sucesso!")
                router.push("/admin/products")
                router.refresh()
            } else {
                const errorData = await res.json()
                toast.error(errorData.error || "Erro ao criar produto.")
            }
        } catch (error) {
            toast.error("Erro de conexão.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link 
                        href="/admin/products" 
                        className="p-3 bg-white rounded-full hover:bg-gray-100 transition-all border border-gray-200 shadow-sm hover:scale-105"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Adicionar Produto</h1>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Foto do Prato</label>
                            
                            {!preview ? (
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer relative group">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="bg-orange-50 text-orange-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">Clique para enviar uma foto</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG ou WEBP</p>
                                </div>
                            ) : (
                                <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-200 group shadow-sm">
                                    <Image 
                                        src={preview} 
                                        alt="Preview" 
                                        fill 
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            type="button"
                                            onClick={removeImage}
                                            className="bg-white p-3 rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-lg transform hover:scale-110"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Nome do Prato</label>
                            <input 
                                name="name" 
                                onChange={handleChange} 
                                required 
                                placeholder="Ex: X-Bacon Supremo" 
                                className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700 bg-gray-50/50 focus:bg-white" 
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Descrição</label>
                            <textarea 
                                name="description" 
                                onChange={handleChange} 
                                rows={3} 
                                placeholder="Ingredientes e detalhes..." 
                                className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none font-medium text-gray-700 bg-gray-50/50 focus:bg-white" 
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Preço (R$)</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-4 top-3.5 text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="price" 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="0.00" 
                                        className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700 bg-gray-50/50 focus:bg-white" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Categoria</label>
                                <select 
                                    name="categoryId" 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-white text-gray-700 font-medium"
                                >
                                    <option value="">Selecione...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !preview}
                            className={`w-full text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg mt-4 flex items-center justify-center gap-2
                                ${loading || !preview ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 active:scale-[0.98] shadow-orange-200'}
                            `}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Salvar Produto</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
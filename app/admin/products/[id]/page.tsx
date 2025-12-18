"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft, Save, UploadCloud, DollarSign, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface Category {
    id: string
    name: string
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    
    const [fetching, setFetching] = useState(true)
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
        const fetchData = async () => {
            try {
                const catRes = await fetch("/api/categories")
                const catData = await catRes.json()
                setCategories(catData)

                const prodRes = await fetch(`/api/admin/products/${id}`)
                
                if (prodRes.ok) {
                    const prodData = await prodRes.json()
                    setFormData({
                        name: prodData.name,
                        description: prodData.description || "",
                        price: prodData.price.toString(), 
                        categoryId: prodData.categoryId,
                        imageUrl: prodData.imageUrl 
                    })
                    setPreview(prodData.imageUrl)
                } else {
                    toast.error("Erro ao carregar produto.")
                    router.push("/admin/products")
                }
            } catch (error) {
                toast.error("Erro de conexão")
            } finally {
                setFetching(false)
            }
        }
        if (id) fetchData()
    }, [id, router])

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Produto atualizado!")
                router.push("/admin/products")
                router.refresh()
            } else {
                toast.error("Erro ao atualizar produto.")
            }
        } catch (error) {
            toast.error("Erro de conexão.")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600 h-10 w-10" /></div>

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
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Editar Produto</h1>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Foto do Prato</label>
                            
                            <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50">
                                {preview ? (
                                    <Image src={preview} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 font-medium">Sem imagem</div>
                                )}
                                
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                
                                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl text-xs font-bold shadow-sm pointer-events-none text-gray-800 flex items-center gap-2">
                                    <UploadCloud size={16} className="text-orange-600" /> Clique para alterar
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Nome do Prato</label>
                            <input 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                                className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700 bg-gray-50/50 focus:bg-white" 
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Descrição</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                rows={3} 
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
                                        value={formData.price} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700 bg-gray-50/50 focus:bg-white" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Categoria</label>
                                <select 
                                    name="categoryId" 
                                    value={formData.categoryId} 
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
                            disabled={loading}
                            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 mt-4 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Salvar Alterações</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
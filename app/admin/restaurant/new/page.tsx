"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Store, UploadCloud, Clock, DollarSign, Check, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { createRestaurant } from "@/app/_actions/restaurant"

interface Category {
  id: string
  name: string
}

export default function NewRestaurantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => toast.error("Erro ao carregar categorias"))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setPreview(base64)
        setImageUrl(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("imageUrl", imageUrl)

    const result = await createRestaurant(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success("Restaurante criado com sucesso!")
      router.push("/admin")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="bg-white max-w-2xl w-full rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-orange-600 p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg rotate-3">
              <Store className="text-orange-600 h-8 w-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">Novo Restaurante</h1>
            <p className="text-orange-100 text-sm font-medium">Preencha os dados para começar</p>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 rotate-12 scale-150 transform origin-top-right pointer-events-none" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Logo / Banner</label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 group hover:border-orange-400 transition-colors flex-shrink-0">
                {preview ? (
                  <Image src={preview} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <ImageIcon size={24} />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">Escolha uma imagem</h3>
                <p className="text-sm text-gray-500 mb-2">Recomendado: 500x500px (JPG/PNG)</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold cursor-pointer hover:bg-orange-100 transition-colors pointer-events-none">
                  <UploadCloud size={16} /> Carregar Foto
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Nome do Restaurante</label>
            <input 
              name="name" 
              required 
              placeholder="Ex: Burger King" 
              className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Taxa (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                <input 
                  name="deliveryFee" 
                  type="number" 
                  step="0.01" 
                  required 
                  placeholder="0.00" 
                  className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Tempo (min)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                <input 
                  name="deliveryTime" 
                  type="number" 
                  required 
                  placeholder="30" 
                  className="w-full pl-12 border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block ml-1">Categorias Atendidas</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label key={category.id} className="relative cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="categories" 
                    value={category.id} 
                    className="peer sr-only" 
                  />
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50 peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-700 transition-all hover:bg-white hover:shadow-sm">
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 peer-checked:border-orange-500 peer-checked:bg-orange-500 flex items-center justify-center transition-colors">
                      <Check size={10} className="text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                    <span className="text-sm font-bold text-gray-600 peer-checked:text-orange-900 select-none">
                      {category.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 active:scale-[0.98] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Criar Restaurante"}
          </button>
        </form>
      </div>
    </div>
  )
}
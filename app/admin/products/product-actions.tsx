"use client"

import { Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function ProductActions({ productId }: { productId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const handleEdit = () => {
        router.push(`/admin/products/${productId}`)
    }

    const confirmDelete = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: "DELETE"
            })
            
            if (res.ok) {
                toast.success("Produto excluído com sucesso.")
                router.refresh()
                setShowModal(false)
            } else {
                toast.error("Erro ao excluir produto.")
            }
        } catch (error) {
            toast.error("Erro de conexão.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                    onClick={handleEdit} 
                    className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                    title="Editar"
                >
                    <Pencil size={18} />
                </button>
                <button 
                    onClick={() => setShowModal(true)} 
                    className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    title="Excluir"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 p-1">
                        <div className="p-6 text-center">
                            <div className="mx-auto bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                                <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="text-red-600 h-7 w-7" />
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Tem certeza?</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                Você está prestes a excluir este item permanentemente. Essa ação não pode ser desfeita.
                            </p>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    disabled={loading}
                                    className="flex-1 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    disabled={loading}
                                    className="flex-1 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                                >
                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sim, Excluir"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
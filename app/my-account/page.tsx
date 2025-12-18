"use client"

import { useSession, signOut } from "@/lib/auth-client"
import { useState, useEffect } from "react"
import { Loader2, MapPin, Save, User, ShoppingBag, Trash2, PlusCircle, Pencil, LogOut, ChevronLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useCart } from "../context/cart" 

interface Address {
    id: string
    label: string | null
    street: string
    number: string
    neighborhood: string
    complement: string | null
}

export default function MyAccountPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const { clearCart } = useCart() 
    
    const [loading, setLoading] = useState(false)
    const [fetchingData, setFetchingData] = useState(true)
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    
    const [orders, setOrders] = useState<any[]>([])
    const [loadingOrders, setLoadingOrders] = useState(true)

    const [addresses, setAddresses] = useState<Address[]>([])
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [newAddressForm, setNewAddressForm] = useState({
        label: "",
        street: "",
        number: "",
        neighborhood: "",
        complement: ""
    })
    
    const [formData, setFormData] = useState({
        name: "",
        cpf: "",
        phone: "",
        address: "",
        addressNumber: "",
        neighborhood: ""
    })

    const fetchAddresses = (userId: string) => {
        fetch(`/api/user/address?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAddresses(data)
            })
            .catch(err => console.error(err))
    }

    useEffect(() => {
        if (session?.user) {
            fetch("/api/user/me")
                .then((res) => res.json())
                .then((data) => {
                    setFormData({
                        name: data.name || session.user.name || "",
                        cpf: data.cpf || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        addressNumber: data.addressNumber || "",
                        neighborhood: data.neighborhood || ""
                    })
                })
                .catch((err) => console.error(err))
                .finally(() => setFetchingData(false))

            fetch("/api/orders/my-orders", {
                method: "POST",
                body: JSON.stringify({ userId: session.user.id }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setOrders(data)
                })
                .catch((err) => console.error(err))
                .finally(() => setLoadingOrders(false))

            fetchAddresses(session.user.id)
        }
    }, [session])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewAddressForm({ ...newAddressForm, [e.target.name]: e.target.value })
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/user/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Dados atualizados com sucesso!")
            } else {
                toast.error("Erro ao atualizar dados.")
            }
        } catch (error) {
            toast.error("Erro de conexão.")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveNewAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!session?.user) return
        
        setLoading(true)

        try {
            const res = await fetch("/api/user/address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: session.user.id,
                    ...newAddressForm
                })
            })

            if (res.ok) {
                toast.success("Novo endereço salvo!")
                setNewAddressForm({ label: "", street: "", number: "", neighborhood: "", complement: "" })
                setShowAddressForm(false)
                fetchAddresses(session.user.id)
            } else {
                toast.error("Erro ao salvar endereço.")
            }
        } catch (error) {
            toast.error("Erro de conexão.")
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            clearCart() 
            await signOut()
            window.location.href = "/" 
        } catch (error) {
            toast.error("Erro ao sair.")
        }
    }

    const handleConfirmDelete = async () => {
        try {
            await fetch("/api/user/delete", {
                method: "DELETE",
                body: JSON.stringify({ userId: session?.user?.id }),
            })
            clearCart()
            await signOut()
            window.location.href = "/"
        } catch (error) {
            toast.error("Erro ao excluir conta.")
            setShowDeleteModal(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED": return "bg-green-100 text-green-700"
            case "CANCELED": return "bg-red-100 text-red-700"
            case "PREPARING": return "bg-orange-100 text-orange-700"
            case "DELIVERING": return "bg-blue-100 text-blue-700"
            default: return "bg-gray-100 text-gray-700"
        }
    }

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            PENDING: "Pendente",
            PREPARING: "Preparando",
            IN_PREPARATION: "Preparando",
            DELIVERING: "Saiu para entrega",
            COMPLETED: "Concluído",
            CANCELED: "Cancelado",
            CONFIRMED: "Confirmado"
        }
        return map[status] || status
    }

    const formatDate = (dateString: any) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Sao_Paulo'
        }).format(date)
    }

    if (!session) return null

    return (
        <div className="min-h-screen bg-gray-50 pb-20 relative">
            
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 p-1">
                        <div className="p-6 text-center">
                            <div className="mx-auto bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                                <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center">
                                    <LogOut className="text-red-600 h-7 w-7 ml-1" />
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Sair da conta?</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium">
                                Você precisará fazer login novamente para acessar seus pedidos.
                            </p>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="flex-1 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-200"
                                >
                                    Sair
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 p-1">
                        <div className="p-6 text-center">
                            <div className="mx-auto bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                                <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="text-red-600 h-7 w-7" />
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Excluir conta?</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium">
                                Essa ação é irreversível. Todos os seus dados e histórico serão apagados permanentemente.
                            </p>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleConfirmDelete}
                                    className="flex-1 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-200"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()} 
                        className="text-gray-500 hover:text-orange-600 flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <h1 className="font-bold text-lg text-gray-800">Meu Perfil</h1>
                    
                    <button 
                        onClick={() => setShowLogoutModal(true)} 
                        className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Sair"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 mt-6 space-y-8">
                
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex flex-col items-center gap-4 bg-gradient-to-b from-orange-50 to-white">
                        <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center text-orange-600 border-4 border-white shadow-lg">
                            <User size={40} />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800">{session.user.name}</h2>
                            <p className="text-sm text-gray-500 font-medium">{session.user.email}</p>
                        </div>
                    </div>

                    {fetchingData ? (
                        <div className="p-10 flex justify-center">
                            <Loader2 className="animate-spin text-orange-600 h-8 w-8" />
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Nome Completo</label>
                                    <input name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700 bg-gray-50/50 focus:bg-white" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">CPF</label>
                                    <input 
                                        name="cpf" 
                                        value={formData.cpf} 
                                        disabled 
                                        className="w-full border border-gray-200 rounded-2xl p-3.5 bg-gray-100 text-gray-400 font-medium cursor-not-allowed" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Telefone</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-700 bg-gray-50/50 focus:bg-white" />
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm uppercase tracking-wide">
                                    <MapPin size={16} className="text-orange-600" /> Endereço Principal (Antigo)
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <input name="address" value={formData.address} onChange={handleChange} placeholder="Rua" className="w-full border border-gray-200 rounded-2xl p-3.5 bg-gray-50 font-medium text-gray-600" />
                                        </div>
                                        <div>
                                            <input name="addressNumber" value={formData.addressNumber} onChange={handleChange} placeholder="Nº" className="w-full border border-gray-200 rounded-2xl p-3.5 bg-gray-50 font-medium text-gray-600" />
                                        </div>
                                    </div>
                                    <input name="neighborhood" value={formData.neighborhood} onChange={handleChange} placeholder="Bairro" className="w-full border border-gray-200 rounded-2xl p-3.5 bg-gray-50 font-medium text-gray-600" />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 active:scale-[0.98] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Salvar Dados</>}
                            </button>
                        </form>
                    )}
                </div>
                
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <MapPin className="text-orange-600" /> Meus Endereços
                        </h2>
                        <button
                            onClick={() => setShowAddressForm(!showAddressForm)}
                            className="bg-orange-50 text-orange-600 p-2 rounded-xl hover:bg-orange-100 transition-colors"
                        >
                            <PlusCircle size={20} />
                        </button>
                    </div>

                    {showAddressForm && (
                        <form onSubmit={handleSaveNewAddress} className="bg-gray-50 p-5 rounded-2xl space-y-4 mb-6 border border-gray-200 animate-in slide-in-from-top-2">
                            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Novo Endereço</h4>
                            <input 
                                name="label" 
                                value={newAddressForm.label} 
                                onChange={handleNewAddressChange} 
                                placeholder="Nome (Ex: Casa, Trabalho)" 
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500" 
                                required 
                            />
                            <input 
                                name="street" 
                                value={newAddressForm.street} 
                                onChange={handleNewAddressChange} 
                                placeholder="Rua / Avenida" 
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500" 
                                required 
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input 
                                    name="number" 
                                    value={newAddressForm.number} 
                                    onChange={handleNewAddressChange} 
                                    placeholder="Número" 
                                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500" 
                                    required 
                                />
                                <input 
                                    name="neighborhood" 
                                    value={newAddressForm.neighborhood} 
                                    onChange={handleNewAddressChange} 
                                    placeholder="Bairro" 
                                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500" 
                                    required 
                                />
                            </div>
                            <input 
                                name="complement" 
                                value={newAddressForm.complement} 
                                onChange={handleNewAddressChange} 
                                placeholder="Complemento (Opcional)" 
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500" 
                            />
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-md"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Adicionar Endereço"}
                            </button>
                        </form>
                    )}

                    <div className="space-y-3">
                        {addresses.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p>Nenhum endereço salvo.</p>
                            </div>
                        ) : (
                            addresses.map((addr) => (
                                <div key={addr.id} className="border border-gray-100 rounded-2xl p-4 flex justify-between items-start bg-white hover:border-orange-200 transition-colors shadow-sm group">
                                    <div>
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
                                                <MapPin size={14} />
                                            </div>
                                            {addr.label || 'Endereço'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-2 font-medium ml-1">
                                            {addr.street}, {addr.number} - {addr.neighborhood}
                                        </p>
                                        {addr.complement && <p className="text-xs text-gray-400 mt-1 ml-1">Comp: {addr.complement}</p>}
                                    </div>
                                    <button className="text-gray-300 hover:text-orange-500 transition-colors p-2">
                                        <Pencil size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <ShoppingBag className="text-orange-600" /> Histórico Recente
                    </h2>

                    {loadingOrders ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-orange-400" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <ShoppingBag className="mx-auto h-10 w-10 mb-3 opacity-20" />
                            <p>Você ainda não pediu nada.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.slice(0, 3).map((order) => (
                                <div key={order.id} className="border border-gray-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-md transition-all flex justify-between items-center group bg-white">
                                    <div>
                                        <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{order.restaurant.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                            <p className="text-xs text-gray-400">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-extrabold text-gray-800">R$ {Number(order.total).toFixed(2)}</p>
                                        <p className="text-xs text-gray-400 font-medium">{order.products.length} itens</p>
                                    </div>
                                </div>
                            ))}
                            <Link href="/my-orders" className="block w-full text-center py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition-colors">
                                Ver todos os pedidos
                            </Link>
                        </div>
                    )}
                </div>

                <div className="pt-4 pb-8">
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 text-red-500 bg-red-50 px-6 py-4 rounded-2xl font-bold hover:bg-red-100 hover:text-red-600 transition-all w-full justify-center border border-red-100"
                    >
                        <Trash2 size={18} /> Excluir minha conta
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                        Essa ação apagará todo seu histórico e não pode ser desfeita.
                    </p>
                </div>
            </div>
        </div>
    )
}
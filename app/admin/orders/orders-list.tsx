"use client"

import { useState } from "react"
import { CheckCircle, Clock, ShoppingBag, ChefHat, Bike } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Order {
    id: string
    status: string
    total: number
    user: { name: string }
    products: { 
        id: string
        quantity: number
        product: { name: string } 
    }[]
}

export default function OrdersList({ initialOrders }: { initialOrders: Order[] }) {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>(initialOrders)

    const pendingCount = orders.length

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const previousOrders = [...orders]

        if (newStatus === 'COMPLETED') {
            setOrders(current => current.filter(order => order.id !== orderId))
            toast.success("Pedido finalizado e enviado!")
        } else {
            setOrders(current => 
                current.map(order => 
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            )
            toast.info("Status do pedido atualizado.")
        }

        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })

            if (!res.ok) throw new Error()
            
            router.refresh()
        } catch (error) {
            setOrders(previousOrders)
            toast.error("Erro ao atualizar status.")
        }
    }

    return (
        <div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Fila de Produção</h2>
                    <p className="text-sm text-gray-500 font-medium">Gerencie a cozinha em tempo real</p>
                </div>
                
                <div className="flex items-center gap-4 bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100">
                    <div className="bg-white p-2 rounded-xl text-orange-600 shadow-sm">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider">EM ANDAMENTO</p>
                        <p className="text-3xl font-black text-gray-800 leading-none">{pendingCount}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                        <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="font-bold text-gray-800 text-lg">Tudo limpo por aqui!</p>
                        <p className="text-gray-400 text-sm">A cozinha está aguardando novos pedidos.</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col hover:border-orange-200 hover:shadow-md transition-all duration-300">
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-50">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">#{order.id.slice(-4)}</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{order.user.name}</p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 ${
                                    order.status === 'PREPARING' 
                                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                        : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                                }`}>
                                    {order.status === 'PREPARING' ? <ChefHat size={14}/> : <Clock size={14}/>}
                                    {order.status === 'PREPARING' ? 'Preparando' : 'Pendente'}
                                </span>
                            </div>
                            
                            <div className="flex-1 space-y-3 mb-6">
                                {order.products.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm items-center bg-gray-50/50 p-2 rounded-lg">
                                        <span className="text-gray-700 font-medium flex items-center gap-2">
                                            <span className="bg-white px-2 py-0.5 rounded-md text-orange-600 font-bold border border-gray-100 shadow-sm text-xs">
                                                {item.quantity}x
                                            </span> 
                                            {item.product.name}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-50 mt-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Total do Pedido</span>
                                    <span className="font-extrabold text-xl text-gray-900">R$ {Number(order.total).toFixed(2)}</span>
                                </div>

                                {order.status === 'PENDING' && (
                                    <button 
                                        onClick={() => handleStatusChange(order.id, 'PREPARING')} 
                                        className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-bold hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                                    >
                                        <ChefHat size={18} /> Iniciar Preparo
                                    </button>
                                )}
                                {order.status === 'PREPARING' && (
                                    <button 
                                        onClick={() => handleStatusChange(order.id, 'COMPLETED')} 
                                        className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                                    >
                                        <Bike size={18} /> Finalizar & Entregar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
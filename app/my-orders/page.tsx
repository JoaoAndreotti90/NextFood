import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ShoppingBag } from "lucide-react"

export default async function MyOrdersPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        return redirect("/")
    }

    const orders = await db.order.findMany({
        where: { userId: session.user.id },
        include: {
            restaurant: true,
            products: {
                include: { product: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED": return "bg-green-100 text-green-700 border-green-200"
            case "CANCELED": return "bg-red-100 text-red-700 border-red-200"
            case "PREPARING": return "bg-orange-100 text-orange-700 border-orange-200"
            case "DELIVERING": return "bg-blue-100 text-blue-700 border-blue-200"
            default: return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white shadow-sm p-4 sticky top-0 z-10 border-b border-gray-100">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href="/my-account" className="text-gray-500 hover:text-orange-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="font-extrabold text-lg text-gray-800">Meus Pedidos</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-5 mt-4">
                {orders.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center">
                        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                            <ShoppingBag size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-gray-800 font-bold text-lg">Sem pedidos</h3>
                        <p className="text-gray-500 text-sm">Você ainda não pediu nada.</p>
                        <Link href="/" className="mt-6 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">
                            Fazer um Pedido
                        </Link>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-50">
                                <div className="h-14 w-14 rounded-2xl relative overflow-hidden bg-gray-100 border border-gray-100">
                                    {order.restaurant.imageUrl && (
                                        <Image src={order.restaurant.imageUrl} alt={order.restaurant.name} fill className="object-cover" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{order.restaurant.name}</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} • {new Date(order.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </div>
                            </div>

                            <div className="space-y-3 mb-5">
                                {order.products.map(item => (
                                    <div key={item.id} className="flex gap-3 text-sm text-gray-700 items-center">
                                        <span className="font-bold bg-gray-100 px-2 py-0.5 rounded-md text-xs border border-gray-200 text-gray-600">
                                            {item.quantity}x
                                        </span>
                                        <span className="font-medium line-clamp-1">{item.product.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Pago</span>
                                <span className="text-xl font-extrabold text-gray-900">R$ {Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
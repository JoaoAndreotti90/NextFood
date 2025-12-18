import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import OrdersList from "./orders-list"

export default async function AdminOrdersPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return redirect("/")

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { restaurant: true }
    })

    if (!user || user.role !== 'ADMIN') return redirect("/")
    if (!user.restaurant) return redirect("/admin/new")

    const rawOrders = await db.order.findMany({
        where: { 
            restaurantId: user.restaurant.id,
            status: { not: 'COMPLETED' }
        },
        include: { user: true, products: { include: { product: true } } },
        orderBy: { createdAt: 'asc' }
    })

    const activeOrders = rawOrders.map(order => ({
        ...order,
        total: Number(order.total),
        products: order.products.map(p => ({
            ...p,
            price: Number(p.price),
            product: {
                ...p.product,
                price: Number(p.product.price)
            }
        }))
    }))

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link 
                        href="/admin" 
                        className="p-3 bg-white rounded-full hover:bg-gray-100 transition-all border border-gray-200 shadow-sm hover:scale-105"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Pedidos Ativos</h1>
                </div>

                <OrdersList initialOrders={activeOrders} />
            </div>
        </div>
    )
}
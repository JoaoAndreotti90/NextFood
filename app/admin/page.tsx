import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Store, ShoppingBag, Settings, ChevronRight } from "lucide-react"
import UserMenu from "./components/user-menu"

export default async function AdminDashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return redirect("/")

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { restaurant: true } 
    })

    if (!user || user.role !== 'ADMIN') return redirect("/")
    if (!user.restaurant) return redirect("/admin/new")

    const activeOrdersCount = await db.order.count({
        where: {
            restaurantId: user.restaurant.id,
            status: { not: 'COMPLETED' }
        }
    })

    const firstName = user.name.split(" ")[0]

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                            <Store size={20} />
                        </div>
                        <h1 className="text-lg font-bold text-gray-800 hidden sm:block">
                            Painel: <span className="text-orange-600">{user.restaurant.name}</span>
                        </h1>
                    </div>
                    <UserMenu name={firstName} />
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                <div className="mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Visão Geral</h2>
                    <p className="text-gray-500 font-medium">Bem-vindo de volta, {firstName}!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link 
                        href="/admin/orders" 
                        className={`relative overflow-hidden rounded-[2rem] p-8 transition-all hover:scale-[1.02] shadow-sm hover:shadow-xl group ${
                            activeOrdersCount > 0 
                                ? 'bg-orange-600 text-white shadow-orange-200' 
                                : 'bg-white text-gray-800 border border-gray-100 hover:border-orange-200'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${activeOrdersCount > 0 ? 'bg-white/20' : 'bg-orange-50 text-orange-600'}`}>
                                <ShoppingBag size={28} />
                            </div>
                            {activeOrdersCount > 0 && (
                                <span className="bg-white text-orange-600 text-xs font-black px-3 py-1.5 rounded-full animate-pulse uppercase tracking-wider">
                                    {activeOrdersCount} Pendentes
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">Pedidos Ativos</h3>
                            <p className={`text-sm font-medium ${activeOrdersCount > 0 ? 'text-orange-100' : 'text-gray-400'}`}>
                                {activeOrdersCount === 0 ? "A cozinha está tranquila." : "Existem pedidos aguardando preparo!"}
                            </p>
                        </div>
                        <ChevronRight className={`absolute bottom-8 right-8 transition-transform group-hover:translate-x-1 ${activeOrdersCount > 0 ? 'text-white' : 'text-gray-300'}`} />
                    </Link>

                    <Link href="/admin/products" className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all group relative overflow-hidden hover:scale-[1.02]">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Store size={28} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">Cardápio</h3>
                            <p className="text-sm text-gray-400 font-medium">Gerencie pratos, preços e fotos.</p>
                        </div>
                        <ChevronRight className="absolute bottom-8 right-8 text-gray-300 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link href="/admin/settings" className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all group relative overflow-hidden hover:scale-[1.02]">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-gray-100 p-4 rounded-2xl text-gray-600 group-hover:bg-gray-800 group-hover:text-white transition-colors">
                                <Settings size={28} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">Configurações</h3>
                            <p className="text-sm text-gray-400 font-medium">Dados da loja e taxas de entrega.</p>
                        </div>
                        <ChevronRight className="absolute bottom-8 right-8 text-gray-300 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </main>
        </div>
    )
}
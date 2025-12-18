import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PlusCircle, ArrowLeft, Package } from "lucide-react"
import Image from "next/image"
import ProductActions from "./product-actions"

export default async function AdminProductsPage() {
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

    const products = await db.product.findMany({
        where: { restaurantId: user.restaurant.id },
        include: { category: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/admin" 
                            className="p-3 bg-white rounded-full hover:bg-gray-100 transition-all border border-gray-200 shadow-sm hover:scale-105"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </Link>
                        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Cardápio & Produtos</h1>
                    </div>
                    <Link 
                        href="/admin/products/new" 
                        className="bg-orange-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-700 active:scale-95 transition-all shadow-lg shadow-orange-200"
                    >
                        <PlusCircle size={20} /> Novo Produto
                    </Link>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    {products.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center">
                            <div className="bg-orange-50 p-6 rounded-full mb-4">
                                <Package className="h-12 w-12 text-orange-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">Nenhum produto encontrado</h3>
                            <p className="text-gray-400">Comece adicionando itens ao seu cardápio.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Produto</th>
                                        <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria</th>
                                        <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Preço</th>
                                        <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-orange-50/30 transition-colors group">
                                            <td className="p-6 flex items-center gap-4">
                                                <div className="h-14 w-14 relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                                                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                                                </div>
                                                <span className="font-bold text-gray-800 text-lg">{product.name}</span>
                                            </td>
                                            <td className="p-6">
                                                <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600 uppercase tracking-wide">
                                                    {product.category.name}
                                                </span>
                                            </td>
                                            <td className="p-6 font-bold text-gray-900">
                                                R$ {Number(product.price).toFixed(2)}
                                            </td>
                                            <td className="p-6 text-right">
                                                <ProductActions productId={product.id} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
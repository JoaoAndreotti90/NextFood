import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, Store, Clock, Bike, Utensils } from "lucide-react"
import UserHeader from "@/app/components/user-header"

interface HomeProps {
    searchParams: Promise<{
        search?: string
        category?: string
    }>
}

export default async function Home({ searchParams }: HomeProps) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (session) {
        const user = await db.user.findUnique({
            where: { id: session.user.id }
        })

        if (user?.role === 'ADMIN') {
            redirect("/admin")
        }
    }

    const params = await searchParams
    const search = params.search || ""
    const categoryId = params.category || ""

    const categories = await db.category.findMany({
        orderBy: { name: 'asc' }
    })

    const restaurants = await db.restaurant.findMany({
        where: {
            name: {
                contains: search,
                mode: 'insensitive',
            },
            ...(categoryId && {
                categories: {
                    some: {
                        id: categoryId
                    }
                }
            }),
        },
        include: {
            products: { take: 3 },
            categories: true, 
        }
    })

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="bg-orange-600 shadow-lg sticky top-0 z-30 rounded-b-[2rem]">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-6">
                    <Link href="/" className="flex flex-col group">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                            NextFood <Utensils className="opacity-80 group-hover:rotate-12 transition-transform" />
                        </h1>
                    </Link>

                    <div className="flex-1 max-w-2xl mx-4 hidden sm:block">
                        <form className="relative group">
                            {categoryId && <input type="hidden" name="category" value={categoryId} />}
                            <input 
                                name="search"
                                defaultValue={search}
                                placeholder="O que vamos comer hoje?" 
                                className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-medium text-gray-700 bg-white/95 border-0 shadow-sm focus:bg-white focus:ring-4 focus:ring-orange-400/30 outline-none transition-all placeholder:text-gray-400"
                            />
                            <Search className="absolute left-4 top-4 text-orange-500" size={20} />
                        </form>
                    </div>

                    <div>
                        <UserHeader />
                    </div>
                </div>
                
                <div className="sm:hidden px-6 pb-6">
                    <form className="relative">
                        {categoryId && <input type="hidden" name="category" value={categoryId} />}
                        <input 
                            name="search"
                            defaultValue={search}
                            placeholder="Buscar restaurantes..." 
                            className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-medium text-gray-700 bg-white shadow-sm outline-none"
                        />
                        <Search className="absolute left-4 top-4 text-orange-500" size={20} />
                    </form>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-10 space-y-12">
                
                <section>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-xl font-bold text-gray-800">Categorias</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                        <Link 
                            href="/" 
                            className={`flex flex-col items-center gap-3 min-w-[85px] cursor-pointer group ${!categoryId ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-sm transition-all ${!categoryId ? 'bg-orange-600 text-white shadow-orange-200 shadow-lg scale-105' : 'bg-white text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500'}`}>
                                <Utensils size={28} />
                            </div>
                            <span className={`text-xs font-bold ${!categoryId ? 'text-orange-600' : 'text-gray-500'}`}>Todas</span>
                        </Link>

                        {categories.map((category) => (
                            <Link 
                                key={category.id}
                                href={`/?category=${category.id}`}
                                className={`flex flex-col items-center gap-3 min-w-[85px] cursor-pointer group ${categoryId === category.id ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
                            >
                                <div className={`w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-sm relative transition-all group-hover:scale-105 group-hover:shadow-md 
    ${categoryId === category.id 
        ? 'ring-4 ring-orange-600 ring-offset-2 m-3' // Adicionei 'm-1' (margem) para não cortar
        : ''
    }`}
>
    <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
</div>
                                <span className={`text-xs font-bold ${categoryId === category.id ? 'text-orange-600' : 'text-gray-500'}`}>{category.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-xl font-bold text-gray-800">Restaurantes Populares</h2>
                    </div>
                    
                    {restaurants.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm mx-2">
                            <Store className="h-16 w-16 text-gray-200 mb-4" />
                            <p className="text-gray-500 font-medium">Nenhum restaurante encontrado.</p>
                            <Link href="/" className="text-orange-600 text-sm font-bold hover:underline mt-2">Limpar filtros</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
                            {restaurants.map((restaurant) => (
                                <Link key={restaurant.id} href={`/restaurantes/${restaurant.id}`} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                                    <div className="relative h-48 w-full bg-gray-100">
                                        <Image src={restaurant.imageUrl || "/default-restaurant.png"} alt={restaurant.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1.5">
                                            <Clock size={14} className="text-orange-500" /> {restaurant.deliveryTimeMinutes} min
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-extrabold text-gray-800 text-lg group-hover:text-orange-600 transition-colors line-clamp-1">{restaurant.name}</h3>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-lg">
                                                <Bike size={14} className="text-orange-600" />
                                                <span className="text-xs font-bold text-orange-700">
                                                    {Number(restaurant.deliveryFee) === 0 ? 'Grátis' : `R$ ${Number(restaurant.deliveryFee).toFixed(2)}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
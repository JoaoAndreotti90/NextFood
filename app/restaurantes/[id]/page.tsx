import { notFound } from "next/navigation"
import Image from "next/image"
import { db } from "@/lib/prisma"
import { Clock, Bike } from "lucide-react"
import BackButton from "@/app/components/back-button"
import ProductList from "./components/product-list"

interface RestaurantPageProps {
  params: Promise<{
    id: string
  }>
}

const RestaurantPage = async ({ params }: RestaurantPageProps) => {
  const { id } = await params

  const restaurant = await db.restaurant.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: {
          category: { name: 'asc' },
        },
        include: {
          restaurant: {
            select: {
              name: true,
              imageUrl: true,
            },
          },
          category: true,
        },
      },
    },
  })

  if (!restaurant) {
    return notFound()
  }

  const formattedProducts = restaurant.products.map((product) => ({
    ...product,
    price: Number(product.price),
  }))

  const distinctCategories = Array.from(
    new Set(formattedProducts.map((product) => product.category.name))
  )

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="relative h-[300px] w-full bg-gray-900">
        <BackButton />
        
        <Image
          src={restaurant.imageUrl || "/default-restaurant.png"}
          alt={restaurant.name}
          fill
          className="object-cover opacity-80"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-6 left-0 w-full px-6 text-white z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{restaurant.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                <Clock size={16} className="text-orange-400" />
                <span>{restaurant.deliveryTimeMinutes} min</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                <Bike size={16} className="text-orange-400" />
                <span>
                    {Number(restaurant.deliveryFee) === 0 
                        ? "Entrega Grátis" 
                        : `R$ ${Number(restaurant.deliveryFee).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 space-y-12">
        {distinctCategories.map((categoryName) => {
            const productsInCategory = formattedProducts.filter(
                (product) => product.category.name === categoryName
            )

            return (
                <div key={categoryName}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        {categoryName}
                    </h2>
                    <ProductList 
                        products={productsInCategory} 
                        deliveryFee={Number(restaurant.deliveryFee)}
                    />
                </div>
            )
        })}
      </div>
    </div>
  )
}

export default RestaurantPage
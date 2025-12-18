"use client"

import Image from "next/image"
import { useCart } from "@/app/context/cart" 
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface Product {
    id: string
    name: string
    description: string
    price: number
    imageUrl: string
    restaurantId: string
}

interface ProductListProps {
    products: Product[]
    deliveryFee: number
}

export default function ProductList({ products, deliveryFee }: ProductListProps) {
    const { addToCart } = useCart()

    const handleAddToCart = (product: Product) => {
        addToCart({
            ...product,
            quantity: 1,
            deliveryFee: Number(deliveryFee)
        })
        toast.success("Produto adicionado à sacola!")
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
                <div key={product.id} className="group flex w-full bg-white rounded-3xl p-3 gap-4 border border-gray-100 hover:border-orange-100 hover:shadow-lg transition-all duration-300">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-gray-100">
                        <Image 
                            src={product.imageUrl} 
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight">{product.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1 font-medium">{product.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-gray-900 text-lg">
                                R$ {Number(product.price).toFixed(2)}
                            </span>
                            <button 
                                onClick={() => handleAddToCart(product)}
                                className="h-9 w-9 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 active:scale-90 transition-all shadow-orange-200 shadow-md"
                            >
                                <Plus size={18} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
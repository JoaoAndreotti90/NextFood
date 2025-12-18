"use client"

import { useCart } from "../context/cart"
import { X, Minus, Plus, Trash, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function CartSidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const { products, removeFromCart, total, increaseQuantity, decreaseQuantity } = useCart()
    const pathname = usePathname()

    useEffect(() => {
        if (products.length > 0) {
            setIsOpen(true)
        }
    }, [products.length])

    if (pathname.startsWith("/admin")) {
        return null
    }

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-[60] transition-all duration-200 ${products.length > 0 && !isOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-orange-600 text-white p-4 rounded-full shadow-xl shadow-orange-600/30 flex items-center gap-2 hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all"
                >
                    <ShoppingBag />
                    <span className="bg-white text-orange-600 h-6 w-6 flex items-center justify-center rounded-full text-xs font-bold">
                        {products.length}
                    </span>
                </button>
            </div>

            <div 
                className={`fixed inset-0 bg-black/50 z-[70] transition-opacity duration-200 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(false)}
            />

            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[80] shadow-2xl transform transition-transform duration-200 ease-out will-change-transform ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-extrabold text-xl flex items-center gap-2 text-gray-800">
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                                <ShoppingBag size={20} /> 
                            </div>
                            Sua Sacola
                        </h2>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-orange-600 bg-white p-2 rounded-full shadow-sm hover:shadow transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                                <div className="bg-gray-50 p-6 rounded-full">
                                    <ShoppingBag size={48} className="opacity-20" />
                                </div>
                                <p className="font-medium">Sua sacola está vazia.</p>
                            </div>
                        ) : (
                            products.map((product) => (
                                <div key={product.id} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                    <div className="h-24 w-24 relative rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                        <Image 
                                            src={product.imageUrl} 
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight">{product.name}</h3>
                                            <p className="text-orange-600 font-extrabold text-lg mt-1">
                                                R$ {Number(product.price).toFixed(2)}
                                            </p>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 border border-gray-100">
                                                <button 
                                                    onClick={() => decreaseQuantity(product.id)}
                                                    className="p-1.5 bg-white text-gray-600 rounded-lg shadow-sm hover:text-orange-600 disabled:opacity-50 active:bg-gray-100"
                                                    disabled={product.quantity === 1}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                
                                                <span className="font-bold text-sm w-4 text-center text-gray-800">{product.quantity}</span>
                                                
                                                <button 
                                                    onClick={() => increaseQuantity(product.id)}
                                                    className="p-1.5 bg-orange-600 text-white rounded-lg shadow-sm hover:bg-orange-700 active:bg-orange-800"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <button 
                                                onClick={() => removeFromCart(product.id)}
                                                className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {products.length > 0 && (
                        <div className="p-6 border-t bg-gray-50/50 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Total</span>
                                <span className="text-3xl font-extrabold text-gray-900">
                                    R$ {total.toFixed(2)}
                                </span>
                            </div>
                            
                            <Link 
                                href="/checkout" 
                                onClick={() => setIsOpen(false)}
                                className="block w-full bg-orange-600 text-white text-center py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-[0.98]"
                            >
                                Finalizar Pedido
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
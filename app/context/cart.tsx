"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner" 

interface Product {
    id: string
    name: string
    price: number
    quantity: number
    imageUrl: string
    restaurantId: string
    deliveryFee?: number
}

interface CartContextType {
    products: Product[]
    addToCart: (product: Product) => void
    decreaseProduct: (productId: string) => void
    removeFromCart: (productId: string) => void
    clearCart: () => void
    total: number
}

const CartContext = createContext<CartContextType>({
    products: [],
    addToCart: () => {},
    decreaseProduct: () => {},
    removeFromCart: () => {},
    clearCart: () => {},
    total: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([])
    const { data: session } = useSession()

    const localStorageKey = session?.user?.id ? `cart-${session.user.id}` : "cart-guest"

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const savedCart = localStorage.getItem(localStorageKey)
                if (savedCart) {
                    setProducts(JSON.parse(savedCart))
                } else {
                    setProducts([])
                }
            } catch (error) {
                console.error("Erro ao carregar carrinho:", error)
                setProducts([])
            }
        }
    }, [session?.user?.id, localStorageKey])

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(localStorageKey, JSON.stringify(products))
            } catch (error) {
                console.error("Erro de cota:", error)
                toast.error("Não foi possível salvar o carrinho. Armazenamento cheio.")
            }
        }
    }, [products, localStorageKey])

    const total = products.reduce((acc, product) => {
        return acc + Number(product.price) * product.quantity
    }, 0)

    const addToCart = (product: Product) => {
        const cleanProduct: Product = {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1,
            imageUrl: product.imageUrl,
            restaurantId: product.restaurantId,
            deliveryFee: product.deliveryFee ? Number(product.deliveryFee) : 0
        }

        if (products.length > 0 && products[0].restaurantId !== cleanProduct.restaurantId) {
            setProducts([cleanProduct])
            return
        }

        setProducts((prev) => {
            const productIsAlreadyInCart = prev.some((p) => p.id === cleanProduct.id)

            if (productIsAlreadyInCart) {
                return prev.map((p) =>
                    p.id === cleanProduct.id
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                )
            }

            return [...prev, cleanProduct]
        })
    }

    const decreaseProduct = (productId: string) => {
        setProducts((prev) => {
            return prev.map((p) => {
                if (p.id === productId) {
                    if (p.quantity === 1) return p
                    return { ...p, quantity: p.quantity - 1 }
                }
                return p
            })
        })
    }

    const removeFromCart = (productId: string) => {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
    }

    const clearCart = () => {
        setProducts([])
        if (typeof window !== "undefined") {
            localStorage.removeItem(localStorageKey)
        }
    }

    return (
        <CartContext.Provider
            value={{
                products,
                addToCart,
                decreaseProduct,
                removeFromCart,
                clearCart,
                total,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
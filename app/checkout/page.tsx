"use client"

import { useSession } from "@/lib/auth-client"
import { useState, useEffect } from "react"
import { Loader2, MapPin, CreditCard, ChevronLeft, Banknote, PlusCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "../context/cart"
import { toast } from "sonner"

interface UserAddress {
    id: string
    label: string | null
    street: string
    number: string
    neighborhood: string
    complement: string | null
    isOldDefault?: boolean
}

export default function CheckoutPage() {
    const { data: session, isPending } = useSession()
    const router = useRouter()
    const { products, total: subtotal } = useCart()

    const deliveryFee = products.length > 0 ? Number(products[0].deliveryFee || 0) : 0
    const finalTotal = subtotal + deliveryFee

    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<"CARD" | "CASH">("CARD")
    
    const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
    const [fetchingAddresses, setFetchingAddresses] = useState(true)

    const [address, setAddress] = useState("")
    const [number, setNumber] = useState("")
    const [complement, setComplement] = useState("")
    const [neighborhood, setNeighborhood] = useState("")
    const [cpfNote, setCpfNote] = useState("")

    const applyAddress = (addr: Partial<UserAddress> | null) => {
        if (addr) {
            setAddress(addr.street || "")
            setNumber(addr.number || "")
            setComplement(addr.complement || "")
            setNeighborhood(addr.neighborhood || "")
        } else {
            setAddress("")
            setNumber("")
            setComplement("")
            setNeighborhood("")
        }
    }

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth/login")
            return
        }

        if (session?.user?.id) {
            const userId = session.user.id
            
            const fetchMultipleAddresses = fetch(`/api/user/address?userId=${userId}`)
                .then(res => res.json())
                .then((data: UserAddress[]) => data)
                .catch(() => [])

            const fetchOldAddress = fetch("/api/user/me")
                .then(res => res.json())
                .then(data => {
                    if (data.address && data.addressNumber) {
                        return {
                            id: 'OLD_DEFAULT',
                            label: 'Principal',
                            street: data.address,
                            number: data.addressNumber,
                            neighborhood: data.neighborhood || '',
                            complement: '',
                            isOldDefault: true,
                        } as UserAddress
                    }
                    return null
                })
                .catch(() => null)

            Promise.all([fetchOldAddress, fetchMultipleAddresses])
                .then(([oldAddress, multipleAddresses]) => {
                    let combinedAddresses: UserAddress[] = []
                    
                    if (oldAddress) {
                        combinedAddresses.push(oldAddress)
                    }

                    const filteredMultiple = multipleAddresses.filter(addr => 
                        !(oldAddress && addr.street === oldAddress.street && addr.number === oldAddress.number)
                    )
                    combinedAddresses = [...combinedAddresses, ...filteredMultiple]

                    setSavedAddresses(combinedAddresses)
                    setFetchingAddresses(false)
                    
                    if (combinedAddresses.length > 0) {
                        applyAddress(combinedAddresses[0])
                        setSelectedAddressId(combinedAddresses[0].id)
                    } else {
                        applyAddress(null)
                        setSelectedAddressId('MANUAL')
                    }
                })
        }
    }, [session, isPending, router])

    const handleSelectAddress = (id: string) => {
        const selected = savedAddresses.find(addr => addr.id === id)
        if (selected) {
            applyAddress(selected)
            setSelectedAddressId(id)
        }
    }

    const handleFinishOrder = async () => {
        if (products.length === 0) return
        setLoading(true)

        const restaurantId = products[0].restaurantId
        const fullAddress = `${address}, ${number} - ${neighborhood} ${complement ? `(${complement})` : ''}`

        const orderData = {
            products,
            restaurantId,
            deliveryAddress: fullAddress,
            total: finalTotal,
            deliveryFee: deliveryFee,
            userId: session?.user?.id
        }

        try {
            if (paymentMethod === "CASH") {
                const response = await fetch("/api/order/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...orderData,
                        method: "CASH",
                    }),
                })

                if (response.ok) {
                    toast.success("Pedido realizado com sucesso!")
                    router.push("/order/success")
                } else {
                    toast.error("Erro ao enviar pedido.")
                }
            } 
            else {
                const response = await fetch("/api/stripe/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderData),
                })

                const data = await response.json()
                if (data.url) {
                    window.location.href = data.url
                } else {
                    toast.error("Erro ao iniciar pagamento.")
                }
            }

        } catch (error) {
            toast.error("Erro ao processar o pedido.")
        } finally {
            setLoading(false)
        }
    }

    if (isPending || !session || fetchingAddresses) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-500 gap-3">
                <Loader2 className="animate-spin h-10 w-10 text-orange-600" />
                <p className="text-sm font-medium">Preparando checkout...</p>
            </div>
        )
    }

    if (products.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm text-center max-w-md w-full border border-gray-100">
                    <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Sacola Vazia</h1>
                    <p className="text-gray-500 mb-8 font-medium">Adicione itens deliciosos para continuar.</p>
                    <button 
                        onClick={() => router.push("/")}
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
                    >
                        Ver Cardápio
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white shadow-sm p-4 sticky top-0 z-20 border-b border-gray-100">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.push("/")} className="text-gray-500 hover:text-orange-600 flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-extrabold text-lg text-gray-800">Finalizar Pedido</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-8">
                    <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-gray-100">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-6 text-lg">
                            <MapPin size={20} className="text-orange-600" /> Onde vamos entregar?
                        </h2>
                        
                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                            {savedAddresses.map(addr => (
                                <button
                                    key={addr.id}
                                    onClick={() => handleSelectAddress(addr.id)}
                                    className={`px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all flex-shrink-0 ${
                                        selectedAddressId === addr.id 
                                        ? "border-orange-600 bg-orange-50 text-orange-700" 
                                        : "border-gray-100 bg-white text-gray-600 hover:border-orange-200"
                                    }`}
                                >
                                    {addr.label || `${addr.street.split(' ')[0]}...`}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => {
                                    applyAddress(null)
                                    setSelectedAddressId('MANUAL')
                                }}
                                className={`px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all flex-shrink-0 flex items-center gap-2 ${
                                    selectedAddressId === 'MANUAL' || savedAddresses.length === 0
                                    ? "border-orange-600 bg-orange-50 text-orange-700" 
                                    : "border-gray-100 bg-white text-gray-600 hover:border-orange-200"
                                }`}
                            >
                                <PlusCircle size={16} /> Novo
                            </button>
                            
                            <button
                                onClick={() => router.push("/my-account")}
                                className="px-5 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all flex-shrink-0"
                            >
                                Gerenciar
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Rua / Avenida</label>
                                <input 
                                    value={address} 
                                    onChange={(e) => {
                                        setAddress(e.target.value)
                                        setSelectedAddressId('MANUAL')
                                    }} 
                                    className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-gray-50/50 focus:bg-white font-medium" 
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <input 
                                        value={number} 
                                        onChange={(e) => {
                                            setNumber(e.target.value)
                                            setSelectedAddressId('MANUAL')
                                        }} 
                                        placeholder="Nº" 
                                        className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-gray-50/50 focus:bg-white font-medium" 
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input 
                                        value={complement} 
                                        onChange={(e) => setComplement(e.target.value)} 
                                        placeholder="Complemento (Opcional)" 
                                        className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-gray-50/50 focus:bg-white font-medium" 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    value={neighborhood} 
                                    onChange={(e) => {
                                        setNeighborhood(e.target.value)
                                        setSelectedAddressId('MANUAL')
                                    }} 
                                    placeholder="Bairro" 
                                    className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-gray-50/50 focus:bg-white font-medium" 
                                />
                                <input 
                                    value={cpfNote} 
                                    onChange={(e) => setCpfNote(e.target.value)} 
                                    placeholder="CPF na Nota" 
                                    className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-gray-50/50 focus:bg-white font-medium" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-gray-100">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-6 text-lg">
                            <CreditCard size={20} className="text-orange-600" /> Forma de Pagamento
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setPaymentMethod("CARD")}
                                className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all relative ${
                                    paymentMethod === "CARD" 
                                    ? "border-orange-600 bg-orange-50 text-orange-700" 
                                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                {paymentMethod === "CARD" && <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-orange-600" />}
                                <CreditCard size={28} />
                                <span className="text-sm font-bold">Cartão (Online)</span>
                            </button>

                            <button 
                                onClick={() => setPaymentMethod("CASH")}
                                className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all relative ${
                                    paymentMethod === "CASH" 
                                    ? "border-green-600 bg-green-50 text-green-700" 
                                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                {paymentMethod === "CASH" && <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-green-600" />}
                                <Banknote size={28} />
                                <span className="text-sm font-bold">Dinheiro / Pix</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-gray-100 sticky top-24">
                        <h2 className="font-bold text-gray-800 mb-6 text-lg">Resumo do Pedido</h2>
                        
                        <div className="space-y-5 mb-6 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                            {products.map((product) => (
                                <div key={product.id} className="flex gap-4">
                                    <div className="h-16 w-16 bg-gray-100 rounded-xl bg-cover bg-center flex-shrink-0 shadow-sm border border-gray-100" style={{ backgroundImage: `url(${product.imageUrl})` }} />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight">{product.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded-md">Qtd: {product.quantity}</p>
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">
                                        R$ {Number(product.price * product.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 border-t border-gray-100 pt-6">
                            <div className="flex justify-between text-sm text-gray-500 font-medium">
                                <span>Subtotal</span>
                                <span>R$ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-orange-600 font-bold">
                                <span>Entrega</span>
                                <span>
                                    {deliveryFee === 0 ? "Grátis" : `R$ ${deliveryFee.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-3 border-t border-gray-100">
                                <span>Total</span>
                                <span>R$ {finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleFinishOrder}
                            disabled={loading || products.length === 0 || !address || !number || !neighborhood}
                            className={`w-full text-white py-4 rounded-2xl font-bold text-lg transition-all mt-8 shadow-lg flex items-center justify-center active:scale-[0.98]
                                ${paymentMethod === "CARD" 
                                    ? "bg-orange-600 hover:bg-orange-700 shadow-orange-200" 
                                    : "bg-green-600 hover:bg-green-700 shadow-green-200"
                                }
                                ${!address || !number || !neighborhood ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 
                                paymentMethod === "CARD" ? `Pagar R$ ${finalTotal.toFixed(2)}` : "Finalizar Pedido"
                            }
                        </button>
                        {(!address || !number || !neighborhood) && (
                            <p className="text-orange-500 text-xs mt-3 text-center font-bold bg-orange-50 py-2 rounded-lg">Preencha o endereço completo para continuar.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./providers/auth-provider" 
import { Toaster } from "sonner"
import { CartProvider } from "./context/cart"
import CartSidebar from "./components/cart-sidebar"

export const metadata: Metadata = {
  title: "NextFood", 
  description: "Seu app de delivery",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
           <CartProvider>
              {children}
              <CartSidebar />
              
              <Toaster richColors position="top-center" closeButton />
           </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
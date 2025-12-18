import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./providers/auth-provider" 
import { Toaster } from "sonner"

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
            {children}
            <Toaster richColors position="top-center" closeButton />
        </AuthProvider>
      </body>
    </html>
  )
}
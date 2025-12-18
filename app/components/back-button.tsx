"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface BackButtonProps {
  href?: string
}

const BackButton = ({ href = "/" }: BackButtonProps) => {
  return (
    <Link
      href={href}
      className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur-md p-3 rounded-full text-gray-800 shadow-sm hover:bg-white hover:scale-105 transition-all active:scale-95 border border-gray-100 group"
    >
      <ChevronLeft size={24} className="text-gray-600 group-hover:text-orange-600 transition-colors" />
    </Link>
  )
}

export default BackButton
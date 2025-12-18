"use server"

import { db } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createRestaurant(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return { error: "Usuário não autenticado" }
  }

  const name = formData.get("name") as string
  const deliveryFee = formData.get("deliveryFee") as string
  const deliveryTime = formData.get("deliveryTime") as string
  const imageUrl = formData.get("imageUrl") as string
  
  const selectedCategories = formData.getAll("categories") as string[]

  try {
    await db.restaurant.create({
      data: {
        name,
        imageUrl: imageUrl || "",
        deliveryFee: Number(deliveryFee),
        deliveryTimeMinutes: Number(deliveryTime),
        adminId: session.user.id,
        categories: {
          connect: selectedCategories.map((id) => ({ id })),
        },
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { error: "Erro ao criar restaurante" }
  }
}
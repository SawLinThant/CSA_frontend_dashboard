import { z } from 'zod'

export const LoginSchema = z.object({
  phone: z.string().min(6),
  password: z.string().min(8),
})

export type LoginInput = z.infer<typeof LoginSchema>

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
})

export type Product = z.infer<typeof ProductSchema>


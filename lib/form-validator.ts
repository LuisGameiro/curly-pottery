import { z } from 'zod'

export const CategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  image: z.url('Please enter a valid image URL'),
})

export type CategoryInput = z.infer<typeof CategorySchema>

export const VariantSchema = z.object({
  id: z.string(),
  price: z.number().min(0, 'Price must be a positive number'),
  sku: z.string(),
  stock: z.number().min(0, 'Stock must be a positive number'),
  sizeName: z.string().min(1, 'Size is required'),
  colorName: z.string().min(1, 'Color name is required'),
  colorHex: z.string().min(1, 'Color hex is required'),
  availableForSale: z.boolean(),
  isExpanded: z.boolean(),
  details: z.array(
    z.object({
      title: z.string(),
      description: z.string().min(1, 'Description required'),
    }),
  ),
  discounts: z.array(
    z.object({
      code: z.string().optional(),
      type: z.string(),
      value: z.number(),
      percentage: z.number(),
    }),
  ),
  images: z.any(),
  files: z.array(z.any()).min(1, 'At least one image is required'),
  previews: z.array(z.string()).min(1, 'At least one preview is required'),
})

export const ProductSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000),
  files: z.array(z.any()).min(1, 'At least one image is required'),
  images: z.any(),
  previews: z
    .array(z.url('Please provide a valid image URL'))
    .min(1, 'At least one variant is required'),
  requiresShipping: z.boolean(),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  variants: z.array(VariantSchema).min(1, 'At least one variant is required'),
})

export type ProductInput = z.infer<typeof ProductSchema>
export type VariantInput = z.infer<typeof VariantSchema>

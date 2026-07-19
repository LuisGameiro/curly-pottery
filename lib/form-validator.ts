import { z } from 'zod'

const isValidSiteOrAbsoluteUrl = (value: string) => {
  if (value.startsWith('/')) {
    return true
  }

  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const isInternalUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    const appUrl = new URL(
      process.env.NEXT_PUBLIC_APP_URL || 'https://example.com',
    )
    return parsed.hostname === appUrl.hostname
  } catch {
    return url.startsWith('/')
  }
}

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
    }),
  ),
  images: z.array(z.string()).default([]),
  files: z.array(z.string()).min(1, 'At least one image is required'),
  previews: z.array(z.string()).min(1, 'At least one preview is required'),
})

export const ProductSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  hide: z.boolean(),
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000),
  files: z.array(z.string()).min(1, 'At least one image is required'),
  images: z.array(z.string()).default([]),
  previews: z
    .array(z.url('Please provide a valid image URL'))
    .min(1, 'At least one variant is required'),
  requiresShipping: z.boolean(),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  variants: z.array(VariantSchema).min(1, 'At least one variant is required'),
})

export type ProductInput = z.infer<typeof ProductSchema>
export type VariantInput = z.infer<typeof VariantSchema>

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  acceptsMarketing: z.boolean().default(false),
})

export const newsletterSubscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().trim().max(50).optional().or(z.literal('')),
  lastName: z.string().trim().max(50).optional().or(z.literal('')),
})

export type NewsletterSubscriptionInput = z.infer<
  typeof newsletterSubscriptionSchema
>

export const newsletterCampaignSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Campaign name must be at least 2 characters')
      .max(120, 'Campaign name must be 120 characters or less'),
    subject: z
      .string()
      .trim()
      .min(3, 'Subject must be at least 3 characters')
      .max(140, 'Subject must be 140 characters or less'),
    previewText: z.string().trim().max(180).optional().or(z.literal('')),
    heading: z
      .string()
      .trim()
      .min(3, 'Heading must be at least 3 characters')
      .max(120, 'Heading must be 120 characters or less'),
    message: z
      .string()
      .trim()
      .min(20, 'Message must be at least 20 characters')
      .max(3000, 'Message must be 3000 characters or less'),
    ctaLabel: z.string().trim().max(60).optional().or(z.literal('')),
    ctaUrl: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || isValidSiteOrAbsoluteUrl(value),
        'Please enter a valid URL or site path',
      )
      .optional()
      .or(z.literal('')),
    productIds: z
      .array(z.string())
      .min(1, 'Select at least one product')
      .max(6, 'You can feature up to 6 products'),
    dailySendLimit: z
      .number()
      .int('Daily send limit must be a whole number')
      .min(1, 'Daily send limit must be at least 1')
      .max(500, 'Daily send limit must be 500 or less')
      .default(50),
  })
  .refine(
    ({ ctaLabel, ctaUrl }) =>
      (!ctaLabel && !ctaUrl) || (Boolean(ctaLabel) && Boolean(ctaUrl)),
    {
      message: 'CTA label and URL must be provided together',
      path: ['ctaUrl'],
    },
  )

export type NewsletterCampaignInput = z.infer<typeof newsletterCampaignSchema>

export const newsletterTokenSchema = z.object({
  token: z.string().trim().min(1, 'Token is required'),
})

export const newsletterCampaignIdSchema = z.object({
  campaignId: z.string().trim().min(1, 'Campaign ID is required'),
})

export const newsletterTrackedLinkSchema = z.object({
  token: z.string().trim().min(1, 'Tracking token is required'),
  url: z
    .string()
    .trim()
    .refine(isValidSiteOrAbsoluteUrl, 'Please enter a valid URL or site path')
    .refine(isInternalUrl, 'External URLs are not allowed'),
  signature: z.string().trim().min(1, 'Signature is required'),
  label: z.string().trim().max(120).optional().or(z.literal('')),
  productId: z.string().trim().optional().or(z.literal('')),
})

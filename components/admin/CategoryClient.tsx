'use client'

import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@lib/slugify'
import {
  Button,
  Container,
  Input,
  Text,
  InputImage,
  LoadingDots,
} from '@components/ui'
import { CategorySchema } from '@lib/form-validator'
import { useRouter } from 'next/navigation'
import { Category } from '@lib/types/types'
import { toast } from 'sonner'
import { syncImages } from '@lib/client-images'
import { upsertCategory } from '@actions/category.actions'

export default function CategoryClient({
  category,
  isEditMode,
}: {
  category: Category | null
  isEditMode: boolean
}) {
  const router = useRouter()

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [gallery, setGallery] = useState<{
    files: (File | string)[]
    previews: string[]
  }>({
    files: category?.image ? [category.image] : [],
    previews: category?.image ? [category.image] : [],
  })
  const [formData, setFormData] = useState({
    id: category?.id || '',
    name: category?.name || '',
    slug: category?.slug || '',
    image: category?.image || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setLoading(true)
      setFormData((prev) => ({
        ...prev,
      }))
      setErrors({})
      const validation = CategorySchema.safeParse({
        ...formData,
        image: gallery.previews[0],
      })

      if (!validation.success) {
        const fieldErrors: { [key: string]: string } = {}
        validation.error.issues.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message
        })
        setErrors(fieldErrors)
        return
      }

      const responseImage = await syncImages({
        currentItems: gallery.files,
        existingUrls: [category?.image || ''],
      })
      if (!responseImage.success) {
        return toast(responseImage.message)
      }

      const response = await upsertCategory({
        id: formData.id,
        name: formData.name,
        image: responseImage.data
          ? responseImage.data[0]
          : category?.image || '',
      })

      if (response.success) {
        router.replace('/admin/categories')
        router.refresh()
      } else {
        setErrors({ from: response?.message || 'Failed to save category' })
        return toast(responseImage.message)
      }
    } catch (err) {
      console.error('Submit error:', err)
      setErrors({ form: 'An error occurred while saving.' })
      toast('An error occurred while saving.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingDots />

  return (
    <Container>
      <header>
        <Link
          href="/admin/categories"
          className="flex items-center gap-2 text-muted hover:text-muted/60 mb-4 transition"
        >
          <ArrowLeft size={16} /> Back to Categories
        </Link>

        <div className="flex items-center justify-between">
          <Text variant="heading">
            {isEditMode ? 'Edit Category' : 'New Category'}
          </Text>
          <Button
            onClick={handleSubmit}
            type="submit"
            variant="slim"
            disabled={loading}
          >
            {isEditMode ? 'Save Category' : 'Create Category'}
          </Button>
        </div>
      </header>

      <main>
        <form onSubmit={handleSubmit} className=" space-y-6 ">
          <Input
            label="Category Name"
            error={errors.name}
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Home Decor"
          />

          <div className="flex gap-2 ">
            <span className="font-semibold">URL Slug:</span>
            <span className="text-muted">/{slugify(formData.name)}</span>
          </div>

          <InputImage
            label="Category Image"
            multiple={false}
            files={gallery.files}
            previews={gallery.previews}
            onImagesChange={setGallery}
            error={errors.image}
            size={64}
          />
        </form>
      </main>
    </Container>
  )
}

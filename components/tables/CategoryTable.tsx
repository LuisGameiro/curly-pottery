'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@components/ui'
import { useState } from 'react'
import DataTable from '@components/ui/Table/DataTable'
import { deleteCategory } from 'actions/category.actions'
import { useRouter } from 'next/navigation'
import { Category } from '@lib/types/types'

export default function CategoryTable({
  categories,
}: {
  categories: Category[]
}) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string, name: string, image: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    setIsDeleting(id)
    try {
      const response = await deleteCategory({ id, image })
      if (response.success) {
        router.refresh()
      }
    } catch (error) {
      console.error('Delete failed', error)
    } finally {
      setIsDeleting(null)
    }
  }
  const columns = [
    {
      header: 'Image',
      align: 'center' as const,

      render: (cat: Category) => (
        <Image
          src={cat.image || '/placeholder.png'}
          alt={cat.name}
          height={60}
          width={60}
          quality={85}
          style={{
            aspectRatio: '1/1',
            objectFit: 'cover',
          }}
          loading="lazy"
          className="flex justify-center self-center bg-blue "
        />
      ),
    },
    {
      header: 'Name',

      render: (cat: Category) => <span>{cat.name}</span>,
    },
    {
      header: 'Slug',
      render: (cat: Category) => <span>/{cat.slug}</span>,
    },
    {
      header: 'Actions',
      render: (cat: Category) => (
        <div className="flex gap-2 sm:gap-4 justify-center">
          <Link href={`/admin/categories/${cat.id}`}>
            <Button variant="naked">
              <Pencil size={20} />
            </Button>
          </Link>
          <Button
            variant="naked"
            color="danger"
            disabled={isDeleting === cat.id}
            onClick={() => handleDelete(cat.id, cat.name, cat.image)}
          >
            <Trash2 size={20} />
          </Button>
        </div>
      ),
    },
  ]

  return <DataTable data={categories} columns={columns} />
}

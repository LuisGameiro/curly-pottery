'use client'

import { useState, useEffect } from 'react'
import {
  Button,
  Container,
  Text,
  InputImage,
  LoadingDots,
} from '@components/ui'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Trash2, GripVertical, Plus } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import {
  getGalleryImages,
  addGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
} from '@actions/Gallery.actions'
import { GalleryImage } from '@lib/types/types'
import { syncImages } from '@lib/client-images'
import { cn } from '@lib/utils'

// --- Sortable Image Card ---
function SortableImage({
  image,
  onDelete,
}: {
  image: GalleryImage
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group aspect-square rounded-lg overflow-hidden border border-border bg-accent-1',
        isDragging && 'z-50 shadow-xl opacity-80',
      )}
    >
      <Image
        src={image.url}
        alt={image.alt || 'Gallery image'}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 25vw"
      />

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} className="text-white" />
      </button>

      {/* Delete button */}
      <button
        onClick={() => onDelete(image.id)}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red"
        aria-label="Delete image"
      >
        <Trash2 size={16} className="text-white" />
      </button>

      {/* Sort order badge */}
      <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-md">
        #{image.sortOrder + 1}
      </div>
    </div>
  )
}

// --- Main Component ---
export default function GalleryClient() {
  const router = useRouter()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  useEffect(() => {
    loadImages()
  }, [])

  async function loadImages() {
    setLoading(true)
    const response = await getGalleryImages()
    if (response.success) {
      setImages(response.data)
    } else {
      toast.error(response.message)
    }
    setLoading(false)
  }

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return
    setUploading(true)
    try {
      const syncResult = await syncImages({
        currentItems: pendingFiles,
        existingUrls: [],
      })

      if (!syncResult.success) {
        toast.error(syncResult.message)
        return
      }

      // Create a gallery image record for each uploaded URL
      const urls = syncResult.data || []
      for (const url of urls) {
        const result = await addGalleryImage(url)
        if (!result.success) {
          toast.error(`Failed to save image: ${result.message}`)
        }
      }

      toast.success('Images uploaded successfully')
      setPendingFiles([])
      setPendingPreviews([])
      await loadImages()
      router.refresh()
    } catch (error) {
      toast.error('Failed to upload images')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const result = await deleteGalleryImage(id)
    if (result.success) {
      toast.success('Image deleted')
      setImages((prev) => prev.filter((img) => img.id !== id))
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.findIndex((img) => img.id === active.id)
    const newIndex = images.findIndex((img) => img.id === over.id)

    const reordered = arrayMove(images, oldIndex, newIndex)
    setImages(reordered)

    // Persist new order
    const newIds = reordered.map((img) => img.id)
    await reorderGalleryImages(newIds)
    router.refresh()
  }

  if (loading) {
    return (
      <Container className="py-20 flex flex-col items-center justify-center">
        <LoadingDots />
      </Container>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Text variant="pageHeading">Gallery Management</Text>
      </div>

      {/* Existing images grid */}
      {images.length > 0 && (
        <div>
          <Text variant="sectionHeading" className="mb-4">
            Images ({images.length})
          </Text>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((img) => img.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map((image) => (
                  <SortableImage
                    key={image.id}
                    image={image}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Upload area */}
      <Container variant="box" className="space-y-4">
        <Text variant="boxTitle">
          {images.length === 0 ? 'Add Your First Image' : 'Add More Images'}
        </Text>

        <InputImage
          files={pendingFiles}
          previews={pendingPreviews}
          onImagesChange={({ files, previews }) => {
            setPendingFiles(files as File[])
            setPendingPreviews(previews)
          }}
          multiple
          size={64}
        />

        <div className="flex gap-2">
          <Button
            variant="flat"
            onClick={handleUpload}
            disabled={pendingFiles.length === 0 || uploading}
            loading={uploading}
          >
            <Plus size={16} className="mr-1" />
            Upload Images
          </Button>
          {pendingFiles.length > 0 && (
            <Button
              variant="naked"
              onClick={() => {
                setPendingFiles([])
                setPendingPreviews([])
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </Container>

      {/* Empty state */}
      {images.length === 0 && !loading && (
        <div className="text-center py-10">
          <Text variant="muted">
            No gallery images yet. Upload your first image above.
          </Text>
        </div>
      )}
    </div>
  )
}

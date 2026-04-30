'use client'

import React, { useId } from 'react'
import { X, Plus, GripVertical } from 'lucide-react'
import { cn } from '@lib/utils'
import s from './Input.module.css'
import Image from 'next/image'

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const SortableImage = ({
  id,
  src,
  index,
  onRemove,
  size,
  className,
}: {
  id: string
  src: string
  index: number
  onRemove: (index: number) => void
  size: number
  className?: string
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
    width: `${Math.max(1, size) / 4}rem`,
    height: `${Math.max(1, size) / 4}rem`,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-lg border overflow-hidden bg-accent-2 shrink-0 group',
        className,
      )}
    >
      {/* Drag Handle Overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex-center cursor-grab active:cursor-grabbing transition-opacity"
      >
        <GripVertical className="text-white" size={20} />
      </div>

      <Image
        src={src}
        width={100}
        height={100}
        quality={100}
        alt={`Image preview ${index + 1}`}
        className="object-cover w-full h-full"
      />

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 bg-white/80 hover:bg-red hover:text-white p-1 rounded-full transition-colors z-20 focus-visible:outline-2 focus-visible:outline-secondary"
        aria-label={`Remove image ${index + 1}`}
      >
        <X size={14} />
      </button>

      {index === 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-secondary text-[10px] text-white text-center py-0.5 font-bold uppercase tracking-tighter">
          Main
        </div>
      )}
    </div>
  )
}

// --- Main Component ---
const InputImage = ({
  label,
  multiple = false,
  files = [],
  previews = [],
  onImagesChange,
  error,
  size = 24,
  className,
}: {
  label?: string
  multiple?: boolean
  files: (File | string)[]
  previews: string[]
  onImagesChange: (data: {
    files: (File | string)[]
    previews: string[]
  }) => void
  error?: string
  size?: number
  className?: string
}) => {
  const generatedId = useId()
  const errorId = `${generatedId}-error`
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const previewIds = previews.map((src, index) => `${src}-${index}`)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = previewIds.indexOf(active.id as string)
      const newIndex = previewIds.indexOf(over.id as string)

      onImagesChange({
        files: arrayMove(files, oldIndex, newIndex),
        previews: arrayMove(previews, oldIndex, newIndex),
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file))

    onImagesChange({
      files: multiple ? [...files, ...selectedFiles] : [selectedFiles[0]],
      previews: multiple ? [...previews, ...newPreviews] : [newPreviews[0]],
    })
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    const updatedPreviews = previews.filter((_, i) => i !== index)
    if (previews[index].startsWith('blob:'))
      URL.revokeObjectURL(previews[index])
    onImagesChange({ files: updatedFiles, previews: updatedPreviews })
  }

  return (
    <div className={cn(s.container)}>
      {label && <label htmlFor={generatedId}>{label}</label>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-wrap gap-2">
          <SortableContext items={previewIds} strategy={rectSortingStrategy}>
            {previews.map((src, index) => (
              <SortableImage
                key={`${src}-${index}`}
                id={`${src}-${index}`}
                src={src}
                index={index}
                size={size}
                onRemove={removeImage}
                className={className}
              />
            ))}
          </SortableContext>

          {(multiple || previews.length === 0) && (
            <label
              className={cn(
                'w-24 h-24 flex-center flex-col border-2 border-dashed rounded-lg cursor-pointer transition-all shrink-0 bg-accent-2 border-border text-muted hover:border-secondary hover:text-secondary',
              )}
              style={{
                width: `${Math.max(1, size) / 4}rem`,
                height: `${Math.max(1, size) / 4}rem`,
              }}
            >
              <Plus size={24} />
              <span className="font-medium mt-1">
                {multiple ? 'Add More' : 'Upload'}
              </span>
              <input
                id={generatedId}
                type="file"
                multiple={multiple}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-describedby={error ? errorId : undefined}
              />
            </label>
          )}
        </div>
      </DndContext>

      {error && (
        <p id={errorId} className={s.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default InputImage

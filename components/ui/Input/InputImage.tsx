'use client'

import React, { useId } from 'react'
import { X, Plus, Upload } from 'lucide-react'
import { cn } from '@lib/utils'
import s from './Input.module.css'
import Image from 'next/image'

interface ImageInputProps {
  label?: string
  multiple?: boolean
  files: (File | string)[]
  previews: string[]
  onImagesChange: (data: {
    files: (File | string)[]
    previews: string[]
  }) => void
  error?: string
  className?: string
  size?: number
}

const InputImage = ({
  label,
  multiple = false,
  files = [],
  previews = [],
  onImagesChange,
  error,
  size = 24,
  className,
}: ImageInputProps) => {
  const generatedId = useId()
  const errorId = `${generatedId}-error`

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file))

    if (multiple) {
      onImagesChange({
        files: [...files, ...selectedFiles],
        previews: [...previews, ...newPreviews],
      })
    } else {
      if (previews[0]) URL.revokeObjectURL(previews[0])
      onImagesChange({
        files: [selectedFiles[0]],
        previews: [newPreviews[0]],
      })
    }
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    const updatedPreviews = previews.filter((_, i) => i !== index)

    if (previews[index].startsWith('blob:')) {
      URL.revokeObjectURL(previews[index])
    }

    onImagesChange({ files: updatedFiles, previews: updatedPreviews })
  }

  return (
    <div className={cn(s.container)}>
      {label && <label htmlFor={generatedId}>{label}</label>}

      <div className="flex flex-wrap gap-2">
        {previews.map((src, index) => (
          <div
            key={index}
            className={cn(
              'relative rounded-lg border overflow-hidden bg-accent-2 shrink-0 transition-all',
              error ? 'border-red/60' : 'border-border',
              `w-${size} h-${size}`,
              className,
            )}
          >
            <Image
              src={src}
              width={size}
              height={size}
              quality={100}
              alt="Preview"
              className={'object-cover w-full h-full'}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-accent-2 hover:bg-red/60 p-1 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {(multiple || previews.length === 0) && (
          <label
            className={cn(
              'w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all shrink-0 bg-accent-2',
              error
                ? 'border-red/60 bg-red/60 text-red hover:bg-red/20'
                : 'border-border text-muted hover:border-secondary hover:bg-secondary/60 hover:text-secondary',
            )}
          >
            {multiple ? <Plus size={24} /> : <Upload size={24} />}
            <span className=" font-medium mt-1">
              {multiple ? 'Add More' : 'Upload'}
            </span>
            <input
              id={generatedId}
              type="file"
              multiple={multiple}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <p id={errorId} className={s.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default InputImage

'use client'

import React, { useId, useRef } from 'react';
import { ImageIcon, X, Plus, Upload } from 'lucide-react';
import { cn } from "@lib/utils";
import s from "./Input.module.css";

interface ImageInputProps {
  label?: string;
  multiple?: boolean;
  images: File[];            // Array of raw files
  previews: string[];        // Array of blob URLs or existing image URLs
  onImagesChange: (data: { files: File[], previews: string[] }) => void;
  error?: string;
  className?: string;
}

const InputImage: React.FC<ImageInputProps> = ({
  label,
  multiple = false,
  images = [],
  previews = [],
  onImagesChange,
  error,
  className
}) => {
  const generatedId = useId();
  const errorId = `${generatedId}-error`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));

    if (multiple) {
      onImagesChange({
        files: [...images, ...selectedFiles],
        previews: [...previews, ...newPreviews]
      });
    } else {
      // Cleanup previous preview if single mode
      if (previews[0]) URL.revokeObjectURL(previews[0]);
      onImagesChange({
        files: [selectedFiles[0]],
        previews: [newPreviews[0]]
      });
    }
    // Clear input so same file can be uploaded if deleted
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const updatedFiles = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke URL to avoid memory leaks
    if (previews[index].startsWith('blob:')) {
      URL.revokeObjectURL(previews[index]);
    }
    
    onImagesChange({ files: updatedFiles, previews: updatedPreviews });
  };

  return (
    <div className={cn(s.container)}>
      {/* Label styled same as your Input component */}
      {label && (
        <label htmlFor={generatedId}>
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-3">
        {previews.map((src, index) => (
          <div 
            key={index} 
            className={cn(
              "relative w-24 h-24 rounded-lg border overflow-hidden bg-slate-50 shrink-0 transition-all",
              error ? "border-red-500" : "border-slate-200",className
            )}
          >
            <img src={src} alt="Preview"  className={cn("object-cover w-full h-full")} />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {(multiple || previews.length === 0) && (
          <label 
            className={cn(
              "w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all shrink-0 bg-slate-50",
              error 
                ? "border-red-300 bg-red-50 text-red-500 hover:bg-red-100" 
                : "border-slate-300 text-slate-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500"
            )}
          >
            {multiple ? <Plus size={24} /> : <Upload size={24} />}
            <span className="text-[10px] font-medium mt-1">{multiple ? "Add More" : "Upload"}</span>
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
  );
};

export default InputImage;
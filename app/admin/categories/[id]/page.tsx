"use client";

import React, { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { slugify } from "@lib/slugify";
import { Button, Container, Input, Text } from "@components/ui";
import { CategorySchema } from "@lib/form-validator";

export default function CategoryClient() {
  // In Next.js 15, params is a Promise that should be unwrapped with 'use()'
  const rawParams = useParams();
  const id = rawParams?.id as string;
  const isEditMode = !!id && id !== "new";
  
  const router = useRouter();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    image: "",
  });

  // 1. Cleanup Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // 2. Data Fetching for Edit Mode
  useEffect(() => {
    if (isEditMode) {
      setLoadingData(true);
      fetch(`/api/admin/categories/${id}`)
        .then((res) => res.json())
        .then((response) => {
          const categoryData = response.data;
          if (categoryData) {
            setFormData({
              id: categoryData.id ?? "",
              name: categoryData.name ?? "",
              slug: categoryData.slug ?? "",
              image: categoryData.image ?? "",
            });
          }
        })
        .catch((err) => console.error("Fetch error:", err))
        .finally(() => setLoadingData(false));
    }
  }, [isEditMode, id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview for UI
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Note: If you are not using FormData to upload the actual file, 
      // you'll need to handle the upload to S3/Cloudinary here or in handleSubmit
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const currentSlug = slugify(formData.name);
    const validation = CategorySchema.safeParse({
      ...formData,
      slug: currentSlug,
    });

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: currentSlug,
          image: formData.image, // Ensure your API handles the image string or file
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/admin/categories");
        router.refresh();
      } else {
        setErrors({ form: result.message || "Failed to save category" });
      }
    } catch (err) {
      setErrors({ form: "An error occurred while saving." });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-20 flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <Container>
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories">
            <Button variant="naked">
              <ArrowLeft size={24} />
            </Button>
          </Link>
          <Text variant="heading">
            {isEditMode ? "Edit Category" : "New Category"}
          </Text>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          variant="secondary"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
          {isEditMode ? "Save Changes" : "Create Category"}
        </Button>
      </header>

      <main className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Category Name"
            error={errors.name}
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Home Decor"
          />

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-sm font-semibold">URL Slug:</span>
            <code className="text-sm text-blue-600">
              /{slugify(formData.name) || "your-slug"}
            </code>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category Image</label>
            <div className="flex gap-6 items-center p-4 border rounded-xl">
              <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border border-dashed border-slate-300 overflow-hidden shrink-0">
                {preview || formData.image ? (
                  <img
                    src={preview || formData.image}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <ImageIcon className="text-slate-400" size={32} />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-slate-400">
                  {preview ? "New file selected" : formData.image ? "Using saved image" : "Upload JPG, PNG or WebP"}
                </p>
              </div>
            </div>
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}
          </div>
          
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {errors.form}
            </div>
          )}
        </form>
      </main>
    </Container>
  );
}
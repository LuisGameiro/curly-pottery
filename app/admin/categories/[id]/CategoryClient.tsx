"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { slugify } from "@lib/slugify";
import { Button, Container, Input, Text } from "@components/ui";
import { CategorySchema } from "@lib/form-validator";
import { useRouter } from "next/navigation";
import { upsertCategory } from "actions/category.actions";
import InputImage from "@components/ui/Input/InputImage";
import { uploadImagesToBlob } from "@lib/uploadImages";
import Loading from "app/loading";

export default function CategoryClient({
  category,
  isEditMode,
}: {
  category: any;
  isEditMode: boolean;
}) {
  const router = useRouter();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [gallery, setGallery] = useState<{ files: File[]; previews: string[] }>(
    {
      files: [category.image],
      previews: [category.image],
    },
  );
  const [formData, setFormData] = useState({
    id: category.id || "",
    name: category.name || "",
    slug: category.slug || "",
    image: category.image || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = CategorySchema.safeParse({
      ...formData,
      slug: slugify(formData.name),
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
      const url = await uploadImagesToBlob(gallery.files); //TODO better
      const result = await upsertCategory({
        id: formData.id,
        name: formData.name,
        slug: formData.slug,
        image: url ? url[0] : formData.image,
      });

      if (result.success) {
        router.replace("/admin/categories");
        router.refresh();
      } else {
        setErrors({ from: result?.error.message || "Failed to save category" });
      }
    } catch (err) {
      console.error("Submit error:", err);
      setErrors({ form: "An error occurred while saving." });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return Loading();

  return (
    <Container>
      <header>
        <Link
          href="/admin/categories"
          className="flex items-center gap-2 text-muted-foreground hover:text-accent-6 mb-4 transition"
        >
          <ArrowLeft size={16} /> Back to Categories
        </Link>

        <div className="flex items-center justify-between">
          <Text variant="heading">
            {isEditMode ? "Edit Category" : "New Category"}
          </Text>
          <Button
            onClick={handleSubmit}
            type="submit"
            variant="slim"
            disabled={loading}
          >
            {isEditMode ? "Save Category" : "Create Category"}
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
            <span className="text-muted-foreground">
              /{slugify(formData.name)}
            </span>
          </div>
          <InputImage
            label="Category Image"
            multiple={false}
            images={gallery.files}
            previews={gallery.previews}
            onImagesChange={setGallery}
            error={errors.images}
          />
        </form>
      </main>
    </Container>
  );
}

"use client";

import { Container, Text, Button, Input } from "@components/ui";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { slugify } from "@lib/slugify";
import InputTextArea from "@components/ui/Input/InputTextArea";
import { upsertProduct } from "actions/product.actions";
import InputImage from "@components/ui/Input/InputImage";
import Loading from "app/loading";
import InputCheckbox from "@components/ui/Input/InputCheckbox";
import { VariantManager } from "./VariantManager";
import Link from "next/link";
import {
  Category,
  CreateProduct,
  EditProduct,
  EditVariant,
  ProductWithVariantsCategories,
} from "@lib/types/types";
import { Variant } from "@lib/types/types";
import { syncImages } from "actions/images.actions";

interface ProductFormProps {
  initialData: ProductWithVariantsCategories | null;
  categories: Category[];
  isEditMode: boolean;
}

export default function ProductClient({
  initialData,
  categories = [],
  isEditMode,
}: ProductFormProps) {
  const [product, setProduct] = useState<EditProduct>({
    id: initialData?.id ?? "",
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    requiresShipping: initialData?.requiresShipping ?? true,
    files: initialData?.images ?? [],
    previews: initialData?.images ?? [],
    categoryIds: initialData?.categories.map((c: Category) => c.id) || [],
    images: initialData?.images ?? [],
  });

  const initialVariants =
    initialData?.variants.map((v: Variant) => ({
      ...v,
      files: v.images ?? [],
      previews: v.images ?? [],
      isExpanded: false,
    })) ?? [];

  const [variants, setVariants] = useState<EditVariant[]>(
    initialVariants || [
      {
        id: `temp-${Date.now()}`,
        productId: initialData?.id ?? "",
        sku: "",
        price: 0,
        currency: "GBP",
        stock: 0,
        sizeName: "M",
        colorName: "",
        colorHex: "#FFFFFF",
        files: [],
        previews: [],
        details: [],
        discounts: [],
        availableForSale: true,
        isExpanded: true,
      },
    ],
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedVariants = await Promise.all(
        variants.map(async (variant: EditVariant) => {
          const originalVariant = initialVariants.find(
            (v: EditVariant) => v.id === variant.id,
          );
          const oldImages = originalVariant?.images ?? [];
          const imageUrls = await syncImages(variant.files, oldImages);

          if (!imageUrls.success) throw new Error(imageUrls.message);

          return {
            ...variant,
            images: imageUrls.data,
            files: [],
            previews: [],
          };
        }),
      );
      const imageUrls = await syncImages(
        product.files || [],
        initialData?.images ?? [],
      );
      if (!imageUrls.success) throw new Error(imageUrls.message);

      const payload: CreateProduct = {
        ...product,
        variants: updatedVariants,
        images: imageUrls.data,
        files: [],
        previews: [],
      };
      await upsertProduct(payload);
    } catch (error) {
      setErrors(error as { [key: string]: string });
      console.error("Failed to update status", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoriesIds = (id: string) => {
    const ids = product.categoryIds.includes(id)
      ? product.categoryIds.filter((id: string) => id !== id)
      : [...product.categoryIds, id];
    setProduct({ ...product, categoryIds: ids });
  };

  if (loading) return Loading();

  return (
    <Container>
      <header>
        <Link
          href="/admin/products"
          className="flex items-center gap-2 text-muted-foreground hover:text-accent-6  transition"
        >
          <ArrowLeft size={16} /> Back to products
        </Link>

        <div className="flex items-center justify-between">
          <Text variant="heading">
            {isEditMode ? "Edit Product" : "New Product"}
          </Text>
          <Button
            type="submit"
            variant="slim"
            disabled={loading}
            onClick={handleSubmit}
          >
            {isEditMode ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Container variant="box" className="lg:col-span-2 space-y-">
              <Text variant="boxTitle">General Information</Text>
              <div className="space-y-4">
                <Input
                  label="Product Name"
                  error={errors.name}
                  required
                  type="text"
                  value={product.name}
                  onChange={(e) =>
                    setProduct({ ...product, name: e.target.value })
                  }
                  placeholder="e.g. Home Decor"
                />

                <div className="gap-2">
                  <span className=" font-semibold mr-2">Slug: </span>
                  <span>{"/" + slugify(product.name)} </span>
                </div>

                <InputTextArea
                  label="Description"
                  className="flex h-40"
                  error={errors.description}
                  required
                  value={product.description}
                  onChange={(e) =>
                    setProduct({ ...product, description: e.target.value })
                  }
                  placeholder="e.g. Home Decor"
                />
              </div>
            </Container>

            <div className="space-y-6">
              <Container variant="box">
                <Text variant="boxTitle">Organization</Text>
                <div className="space-y-4">
                  <InputCheckbox
                    label="Requires Shipping"
                    checked={product.requiresShipping}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        requiresShipping: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <label>Categories</label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => updateCategoriesIds(cat.id)}
                          className={`px-3 py-1 rounded-full text-xs border transition ${
                            product.categoryIds.includes(cat.id)
                              ? "bg-primary text-accent-6 border-primary  hover:bg-primary/60"
                              : "bg-accent-8 text-accent-0 hover:bg-accent-6"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Container>

              <Container variant="box">
                <Text variant="boxTitle">Product Image</Text>
                <InputImage
                  multiple={false}
                  files={product.files}
                  previews={product.previews}
                  onImagesChange={({ files, previews }) =>
                    setProduct({
                      ...product,
                      files: files,
                      previews: previews,
                    })
                  }
                  className="w-40 h-40 flex flex-1 justify-center"
                  error={errors.images}
                />
              </Container>
            </div>
          </div>
          <VariantManager
            product={product}
            variants={variants}
            setVariants={setVariants}
          />
        </form>
      </main>
    </Container>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@components/ui";
import { useState } from "react";
import DataTable from "@components/ui/Table/DataTable";
import { deleteCategory } from "actions/category.actions";
import { useRouter } from "next/navigation";
import { cn } from "@lib/utils";
import { deleteProduct } from "actions/product.actions";
import { ProductVariant } from "@lib/types/product";
import VariantTable from "./VariantTable";

export default function ProductTable({ products }: { products: any[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setIsDeleting(id);
    try {
      const response = await deleteProduct(id);
      if (response.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const productColumns = [
    {
      header: "Product",
      render: (p: any) => (
        <div className="flex items-center gap-3 justify-center">
          <Image
            src={p.images[0] || "/placeholder.png"}
            width={40}
            height={40}
            className="rounded-md object-cover"
            alt=""
          />
          <div>
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-muted-foreground">
              {p.variants.length} variants
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Stock",
      render: (p: any) => {
        const stock = p.variants.reduce(
          (acc: number, v: any) => acc + v.stock,
          0
        );
        return (
          <span
            className={cn(
              "px-2 py-1 rounded text-xs font-bold",
              stock <= 2
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            )}
          >
            {stock}
          </span>
        );
      },
    },
    {
      header: "Price Range",
      render: (p: any) => {
        const prices = p.variants.map((v: ProductVariant) => v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const stock = p.variants.reduce(
          (acc: number, v: any) => acc + v.stock,
          0
        );
        return (
          <span>
            {minPrice === maxPrice
              ? `£${minPrice}`
              : `£${minPrice} - £${maxPrice}`}
          </span>
        );
      },
    },
    {
      header: "Last Update",
      render: (p: any) => {
        const stock = p.variants.reduce(
          (acc: number, v: any) => acc + v.stock,
          0
        );
        return <span> {new Date(p.updatedAt).toLocaleDateString()}</span>;
      },
    },
    {
      header: "Actions",
      render: (p: any) => (
        <div className="flex gap-2 justify-center">
          <Link href={`/admin/products/${p.id}`}>
            <Button variant="naked">
              <Pencil size={18} />
            </Button>
          </Link>
          <Button
            variant="naked"
            color="danger"
            disabled={!!isDeleting}
            onClick={() => handleDelete(p.id, p.name)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={products}
      columns={productColumns}
      renderExpansion={(product) => (
        <VariantTable variants={product.variants} />
      )}
    />
  );
}

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

export default function VariantTable({ variants }: { variants: any[] }) {
  const variantColumns = [
    {
      header: "SKU",
      render: (v: any) => (
        <span className="text-secondary font-mono">{v.sku}</span>
      ),
    },
    {
      header: "Size / Color",
      render: (v: any) => (
        <span>
          {v.sizeName} {v.colorName && `• ${v.colorName}`}
        </span>
      ),
    },
    {
      header: "Price",
      align: "center" as const,
      render: (v: any) => `£${v.price}`,
    },
    {
      header: "Stock",
      align: "center" as const,
      render: (v: any) => v.stock,
    },
    {
      header: "Discount",
      align: "center" as const,
      render: (v: any) => (v.discounts ? "Active" : "None"),
    },
    {
      header: "Status",
      align: "center" as const,
      render: (v: any) => (
        <span
          className={v.availableForSale ? "text-green-600" : "text-slate-400"}
        >
          {v.availableForSale ? "Active" : "Hidden"}
        </span>
      ),
    },
  ];
  return <DataTable data={variants} columns={variantColumns} />;
}

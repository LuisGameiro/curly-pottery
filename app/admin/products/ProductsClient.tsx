'use client'

import AdminLayout from "../layout";
import { Button, Container, Skeleton, Text, Input } from "@components/ui";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { getAllProducts } from "actions/product.actions"; // You'll need to create this
import Link from "next/link";
import Image from "next/image";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Package,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Product, ProductVariant } from "@lib/types/product";

// export const dynamic = "force-dynamic
export default  function ProductsClient({ products } :{products:Product[]}) {

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // const handleDelete = async (id: string, name: string) => {
  //   if (!confirm(`Delete "${name}"? This will remove all variants.`)) return;
  //   const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  //   const result = await response.json();
  //   if (result.success) router.reload();
  // };

  const filteredProducts = useMemo(() => {
    let items = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variants.some((v: ProductVariant) =>
          v.sku.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    if (sortConfig) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [products, searchTerm, sortConfig]);

  return (
    <Container>
      <header className="flex flex-col lg:flex-row  lg:justify-between">
        <div className=" self-start">
          <Text variant="heading">Products</Text>
          <Text variant="subHeading">Manage your inventory and variants.</Text>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <Search
            className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e)}
          />
          <Link href="/admin/products/new" passHref>
            <Button variant="secondary">
              <Plus size={18} /> New Product
            </Button>
          </Link>
        </div>
      </header>

      <main>
        {filteredProducts.length > 0 ? (
          <div className=" border-2 border-border rounded-xl overflow-hidden shadow-sm">
            <table>
              <thead>
                <tr>
                  <th className="w-2"></th>
                  <th
                    className="cursor-pointer"
                    onClick={() =>
                      setSortConfig({ key: "name", direction: "asc" })
                    }
                  >
                    Product
                  </th>
                  <th>Stock</th>
                  <th>Price Range</th>
                  <th>Last Update</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const totalStock = product.variants.reduce(
                    (acc: any, v: ProductVariant) => acc + v.stock,
                    0,
                  );
                  const prices = product.variants.map(
                    (v: ProductVariant) => v.price,
                  );
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  const isExpanded = expandedRows[product.id];

                  return (
                    <>
                      <tr
                        key={product.id}
                        className="hover:bg-accent-2 transition-colors"
                      >
                        <td>
                          <Button
                            variant="naked"
                            onClick={() => toggleRow(product.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown size={20} />
                            ) : (
                              <ChevronRight size={20} />
                            )}
                          </Button>
                        </td>
                        <td className=" sm:px-4 w-4/12">
                          <div className="flex items-center gap-3 mx-auto">
                            <Image
                              src={product.images[0] || "/placeholder.png"}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="object-cover rounded-lg overflow-hidden justify-end"
                            />
                            <div>
                              <div className="font-medium text-sm">
                                {product.name}
                              </div>
                              <div className="text-xs">
                                {product.variants.length} variants
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${totalStock <= 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                          >
                            {totalStock}
                          </span>
                        </td>
                        <td>
                          {minPrice === maxPrice
                            ? `£${minPrice}`
                            : `£${minPrice} - £${maxPrice}`}
                        </td>
                        <td>
                          {new Date(product.updatedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex gap-2 justify-center">
                            <Link href={`/admin/products/${product.id}`}>
                              <Button variant="naked" title="Edit">
                                <Pencil size={18} />
                              </Button>
                            </Link>
                            <Button
                              variant="naked"
                              title="Delete"
                              color="red"
                              className="text-red"
                              onClick={() =>
                                {}//handleDelete(product.id, product.name)
                              }
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-accent-2">
                          <td colSpan={6}>
                            <div className=" overflow-hidden">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="text-sm">
                                    <th className="py-2">SKU</th>
                                    <th>Size / Color</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Discount</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-center">
                                  {product.variants.map(
                                    (variant: ProductVariant) => (
                                      <tr key={variant.id}>
                                        <td className="py-2  text-secondary">
                                          {variant.sku}
                                        </td>
                                        <td>
                                          {variant.sizeName}{" "}
                                          {variant.colorName &&
                                            `• ${variant.colorName}`}
                                        </td>
                                        <td>£{variant.price}</td>
                                        <td>{variant.stock}</td>
                                        <td>
                                          {variant?.discounts
                                            ? "Active"
                                            : "None"}
                                        </td>

                                        <td>
                                          {variant.availableForSale ? (
                                            <span className="text-green-600">
                                              Active
                                            </span>
                                          ) : (
                                            <span className="text-slate-400">
                                              Hidden
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-16 rounded-lg" />
            ))}
          </div>
        )}
      </main>
    </Container>
  );
}


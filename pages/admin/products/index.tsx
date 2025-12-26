

import AdminLayout from "../layout";
import { Button, Container, Skeleton, Text, Input } from "@components/ui";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { getAllProducts } from "actions/product.actions"; // You'll need to create this
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Plus, Search, ChevronDown, ChevronRight, Package } from "lucide-react";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import { ProductVariant } from "@lib/types/product";

export const dynamic = "force-dynamic";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const products = await getAllProducts(); // Ensure this includes the 'variants' relation
  return {
    props: { products },
    revalidate: 60,
  };
}

export default function ProductsPage({ products }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  // Toggle variant visibility
  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will remove all variants.`)) return;
    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) router.reload();
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let items = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.variants.some((v: ProductVariant) => v.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortConfig) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [products, searchTerm, sortConfig]);

  return (
    <Container className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div>
            <Text variant='heading'>Products</Text>
            <Text>Manage your inventory and variants.</Text>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search name or SKU..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link href="/admin/products/new" passHref>
              <Button className="flex items-center gap-2 whitespace-nowrap">
                <Plus size={18} /> New Product
              </Button>
            </Link>
          </div>
        </div>

        <main>
          {filteredProducts.length > 0 ? (
            <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="w-10 px-6 py-4"></th>
                    <th className="px-6 py-4 text-sm font-semibold cursor-pointer" onClick={() => setSortConfig({key: 'name', direction: 'asc'})}>Product</th>
                    <th className="px-6 py-4 text-sm font-semibold text-center">Stock</th>
                    <th className="px-6 py-4 text-sm font-semibold">Price Range</th>
                    <th className="px-6 py-4 text-sm font-semibold">Last Update</th>
                    <th className="px-6 py-4 text-sm font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => {
                    const totalStock = product.variants.reduce((acc: any, v: ProductVariant) => acc + v.stock, 0);
                    const prices = product.variants.map((v: ProductVariant) => v.price);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const isExpanded = expandedRows[product.id];

                    return (
                      <>
                        <tr key={product.id} className="hover:bg-accent-5 transition-colors group">
                          <td className="px-6 py-3">
                            <button onClick={() => toggleRow(product.id)}>
                              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded border overflow-hidden bg-slate-100">
                                <Image 
                                  src={product.images[0] || "/placeholder.png"} 
                                  alt="" fill className="object-cover" 
                                />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{product.name}</div>
                                <div className="text-xs text-muted-foreground">{product.variants.length} variants</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${totalStock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {totalStock}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm">
                            {minPrice === maxPrice ? `£${minPrice}` : `£${minPrice} - £${maxPrice}`}
                          </td>
                          <td className="px-6 py-3 text-sm text-muted-foreground">
                            {new Date(product.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/products/${product.id}`}>
                                <button className="p-2 hover:bg-secondary rounded-lg transition" title="Edit">
                                  <Pencil size={18} />
                                </button>
                              </Link>
                              <button 
                                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                                onClick={() => handleDelete(product.id, product.name)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Variant Details (Expanded Row) */}
                        {isExpanded && (
                          <tr className="bg-background">
                            <td colSpan={6} className="px-12 py-4">
                              <div className="border rounded-lg bg-background overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead className="bg-background/60 border-border">
                                    <tr>
                                      <th className="px-4 py-2">SKU</th>
                                      <th className="px-4 py-2">Size / Color</th>
                                      <th className="px-4 py-2">Price</th>
                                      <th className="px-4 py-2">Stock</th>
                                      <th className="px-4 py-2">Discount</th>

                                      <th className="px-4 py-2 text-right">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                    {product.variants.map((variant:ProductVariant) => (
                                      <tr key={variant.id}>
                                        <td className="px-4 py-2 font-mono text-blue-600">{variant.sku}</td>
                                        <td className="px-4 py-2">
                                          {variant.sizeName} {variant.colorName && `• ${variant.colorName}`}
                                        </td>
                                        <td className="px-4 py-2">£{variant.price}</td>
                                        <td className="px-4 py-2">{variant.stock}</td>
                                        <td className="px-4 py-2">{variant?.discounts ? "Active" : "None"}</td>

                                        <td className="px-4 py-2 text-right">
                                          {variant.availableForSale ? 
                                            <span className="text-green-600">Active</span> : 
                                            <span className="text-slate-400">Hidden</span>
                                          }
                                        </td>
                                      </tr>
                                    ))}
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
      </div>
    </Container>
  );
}

ProductsPage.Layout = AdminLayout;

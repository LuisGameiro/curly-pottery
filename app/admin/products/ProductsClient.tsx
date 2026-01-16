"use client";

import { Button, Container, Text } from "@components/ui";
import Link from "next/link";
import { useState, useMemo } from "react";
import { ProductFull, ProductVariant } from "@lib/types/product";
import InputSearch from "@components/ui/Input/InputSearch";
import ProductTable from "@components/common/Tables/ProductTable";
import { Plus } from "lucide-react";

export default function ProductsClient({
  products,
}: {
  products:  ProductFull[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

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
        if (a[sortConfig.key as keyof ProductFull] < b[sortConfig.key as keyof ProductFull])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key as keyof ProductFull] > b[sortConfig.key as keyof ProductFull])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [products, searchTerm, sortConfig]);

  return (
    <Container>
      <header>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <Text className="w-full" variant="heading">
            Products
          </Text>
          <InputSearch
            placeholder="Search name or SKU..."
            value={searchTerm}
            onValueChange={(e) => setSearchTerm(e)}
          />
          <Link href="/admin/products/new" passHref>
            <Button variant="slim" className="w-36">
              <span className="mr-1">
                <Plus size={18} />
              </span>
              <span>New Product</span>
            </Button>
          </Link>
        </div>
        <Text variant="subHeading">Manage your inventory and variants.</Text>
      </header>

      <ProductTable products={filteredProducts} />
    </Container>
  );
}

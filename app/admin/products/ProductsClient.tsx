"use client";

import { Button, Container, Text } from "@components/ui";
import Link from "next/link";
import { useState, useMemo } from "react";
import { ProductWithVariantsCategories, Variant } from "@lib/types/types";
import InputSearch from "@components/ui/Input/InputSearch";
import ProductTable from "@components/tables/ProductTable";
import { Plus } from "lucide-react";

export default function ProductsClient({
  products,
}: {
  products: ProductWithVariantsCategories[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProducts = useMemo(() => {
    const items = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variants.some((v: Variant) =>
          v.sku.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    return items;
  }, [products, searchTerm]);

  return (
    <Container>
      <header>
        <div className="flex flex-col sm:flex-row items-center gap-2  justify-between">
          <Text className="w-full" variant="heading">
            Products
          </Text>
          <div className="flex gap-2 w-full  flex-row">
          <InputSearch
            className="w-full"
            placeholder="Search name or SKU..."
            value={searchTerm}
            onValueChange={(e) => setSearchTerm(e)}
          />
          <Link href="/admin/products/new" passHref>
            <Button variant="slim" className="text-nowrap">
              <span className="mr-1">
                <Plus size={18} />
              </span>
              <span>New Product</span>
            </Button>
          </Link>
          </div>
        </div>
        <Text variant="subHeading">Manage your inventory and variants.</Text>
      </header>

      <ProductTable products={filteredProducts} />
    </Container>
  );
}

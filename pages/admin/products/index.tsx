import { serializeProduct, serializeProductVariant } from "actions/product.actions";
import Shop, { ShopPageProps } from "pages/shop"
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { prisma } from "prisma/prisma";
import Admin from "..";
import AdminLayout from "./layout";

export const getServerSideProps: GetServerSideProps<ShopPageProps> = async ({
    query,
}) => {
    const categorySlug =
        typeof query.category === "string" ? query.category : null;

    console.error("Category Slug:", categorySlug);

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });

    const products = await prisma.product.findMany({
        where: categorySlug
            ? {
                categories: {
                    some: {
                        slug: categorySlug,
                    },
                },
            }
            : undefined,
        include: {
            categories: true,
            variants: true,
        },
    });
    console.error("Category Slug:", products);

    return {
        props: {
            products: serializeProductVariant(products),
            categories: serializeProduct(categories),
            activeCategory: categorySlug,
        },
    };
};

export default function AdminProducts({ products,
    categories,
    activeCategory,
}: ShopPageProps) {

    return (
        <Shop admin={true} products={products} categories={categories} activeCategory={activeCategory} />
    )
}

AdminProducts.Layout = AdminLayout
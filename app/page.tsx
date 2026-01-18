import { ProductCard } from "@components/product";
import CategoriesCard from "@components/product/categoriesCard";
import { Grid, Marquee, Hero } from "@components/ui";
import { Product } from "@lib/types/types";
import { getAllCategories } from "actions/category.actions";
import { getRandomProducts } from "actions/product.actions";

export default async function Home() {
  const responseProducts = await getRandomProducts(6);
  const responseCategories = await getAllCategories();

  if (!responseProducts.success || !responseCategories.success)
    throw new Error(responseProducts.message + responseCategories.message);

  const products = responseProducts.data ?? [];
  const categories = responseCategories.data ?? [];

  return (
    <main className="flex flex-col bg-background">
      <Grid variant="filled" layout="A">
        {products.map((product: Product) => (
          <ProductCard
            key={product.id}
            product={product}
            imgProps={{
              alt: product.name,
              width: 1080,
              height: 1080,
              priority: true,
            }}
          />
        ))}
      </Grid>

      <Hero
        headline="About Curly Pottery"
        description="We're dedicated to producing sustainable, artisanal pottery..."
      />

      <Marquee variant="secondary">
        {categories.map((cat) => (
          <CategoriesCard key={cat.id} cat={cat} />
        ))}
      </Marquee>
    </main>
  );
}

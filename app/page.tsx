// app/page.js
import { ProductCard } from "@components/product";
import CategoriesCard from "@components/product/categoriesCard";
import { Grid, Marquee, Hero } from "@components/ui";
import { getAllCategories } from "actions/category.actions";
import { getRandomProducts } from "actions/product.actions";

// This replaces revalidate in getStaticProps
export const revalidate = 300; 

export default async function Home() {
  // Fetch data directly in the Server Component
  const products = await getRandomProducts(6);
  const categories = await getAllCategories();

  return (
    <main className="flex flex-col bg-background">
      <Grid variant="filled" layout="A">
        {products.map((product) => (
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
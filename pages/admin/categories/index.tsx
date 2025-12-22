// app/admin/categories/page.tsx
import { getAllCategories } from "actions/category.actions";
import CategoryTable from "./CategoryTable";

export const dynamic = "force-dynamic"; // Ensures data is always fresh

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          Category Management
        </h1>
        <p className="text-text-secondary mt-1">
          Organize and manage your product categories.
        </p>
      </header>

      {/* <CategoryTable initialData={categories} /> */}
    </div>
  );
}

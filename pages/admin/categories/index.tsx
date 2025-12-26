
import AdminLayout from "../layout";
import { Button, Container, Skeleton } from "@components/ui";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { deleteCategory, getAllCategories } from "actions/category.actions";
import Link from "next/link"; // Use Next.js Link, not Lucide icon
import Image from "next/image";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import { useRouter } from "next/router";
import { Text } from "@components/ui";

export const dynamic = "force-dynamic";

export async function getStaticProps({ locale, locales }: GetStaticPropsContext) {
  const categories = await getAllCategories();
  return {
    props: { categories },
    revalidate: 300,
  };
}

export default function CategoriesPage({ categories }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  const handleDelete = async (id: string, name: string) => {
    console.log("Deleting category with ID:", id,name);
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const result = await response.json();
    console.log("Delete Result:", result);
    if (result.success) {
      router.reload();
      
    }
  };

  return (
    <Container className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <Text variant='heading'>Categories</Text>
            <Text>Manage your store product groupings.</Text>
          </div>
          <Link href="/admin/categories/new" passHref>
            <Button  className="flex items-center gap-2">
              <Plus size={18} /> New Category
            </Button>
          </Link>
        </div>

        <main>
          {categories && categories.length > 0 ? (
            <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background border-b border-border">
                    <th className="px-6 py-4 text-sm font-semibold ">Image</th>
                    <th className="px-6 py-4 text-sm font-semibold  ">Name</th>
                    <th className="px-6 py-4 text-sm font-semibold ">Slug</th>
                    <th className="px-6 py-4 text-sm font-semibold ">Last Update</th>
                    <th className="px-6 py-4 text-sm font-semibold ">Actions</th>

                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                          <Image
                            src={cat.image || "/placeholder.png"} // Ensure your model has an image field
                            alt={cat.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-medium ">{cat.name}</span>
                      </td>
                      <td className="px-6 py-3">
                        <code className="text-xs bg-background/40 px-2 py-1 rounded ">
                          /{cat.slug}
                        </code>
                      </td>
                        <td className="px-6 py-3">
                        <span className="font-medium ">{cat.updatedAt}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/categories/${cat.id}`}>
                            <button className="p-2  hover:text-on-secondary hover:bg-secondary rounded-lg transition" title="Edit">
                              <Pencil size={18} />
                            </button>
                          </Link>
                          <button
                            className="p-2 hover:text-on-secondary hover:bg-secondary rounded-lg transition"
                            title="Delete"
                            onClick={() => handleDelete(cat.id, cat.name)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

CategoriesPage.Layout = AdminLayout;
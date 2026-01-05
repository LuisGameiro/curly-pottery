import AdminLayout from "../layout";
import { Button, Container, Skeleton } from "@components/ui";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { getAllCategories } from "actions/category.actions";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation'import { Text } from "@components/ui";

export const dynamic = "force-dynamic";

export async function getStaticProps({
  locale,
  locales,
}: GetStaticPropsContext) {
  const categories = await getAllCategories();
  return {
    props: { categories },
    revalidate: 300,
  };
}

export default function CategoriesPage({
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const result = await response.json();
    console.log("Delete Result:", result);
    if (result.success) {
      router.reload();
    }
  };

  return (
    <Container>
      <header>
        <div>
          <Text variant="heading">Categories</Text>
          <Text variant="subHeading">Manage your store product groupings.</Text>
        </div>

        <Link href="/admin/categories/new" passHref>
          <Button variant="secondary">
            <Plus size={18} /> New Category
          </Button>
        </Link>
      </header>

      <main>
        {categories && categories.length > 0 ? (
          <div className=" border-2 border-border rounded-xl shadow-sm">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Last Update</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="flex">
                      <Image
                        src={cat.image || "/placeholder.png"} // Ensure your model has an image field
                        alt={cat.name}
                        width={48}
                        height={48}
                        className="object-cover rounded-lg overflow-hidden"
                      />
                    </td>
                    <td>{cat.name}</td>
                    <td>/{cat.slug}</td>
                    <td>{new Date(cat.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2 justify-center">
                        <Link href={`/admin/categories/${cat.id}`}>
                          <Button variant="naked" title="Edit">
                            <Pencil size={18} />
                          </Button>
                        </Link>
                        <Button
                          variant="naked"
                          title="Delete"
                          className="text-red"
                          onClick={() => handleDelete(cat.id, cat.name)}
                        >
                          <Trash2 size={18} />
                        </Button>
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
    </Container>
  );
}

CategoriesPage.Layout = AdminLayout;

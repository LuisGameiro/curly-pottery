

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Button, Skeleton, Text } from "@components/ui";
import { deleteCategory } from "actions/category.actions";
import { useRouter } from "next/navigation";

export default function CategoryTable({ categories }: { categories: any[] }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        setIsDeleting(id);
        try {
            const response = await deleteCategory(id);
            if (response.success) {
                router.refresh();
            }
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setIsDeleting(null);
        }
    };

    if (!categories || categories.length === 0) {
        return (
            <main className="space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-16 rounded-lg" />
                ))}
            </main>)
    }

    return (
        <main>
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
                                            disabled={!!isDeleting}
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
        </main>


    )

}
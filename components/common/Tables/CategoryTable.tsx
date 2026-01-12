"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@components/ui";
import { useState } from "react";
import DataTable from "@components/ui/Table/DataTable";
import { deleteCategory } from "actions/category.actions";
import { useRouter } from "next/navigation";

export default function CategoryTable({ categories }: { categories: any[] }) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();

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
    const columns = [
        {
            header: "Image",
            render: (cat: any) => (
                <div className="flex justify-center items-center w-full">
                    <Image
                        src={cat.image || "/placeholder.png"}
                        alt={cat.name}
                        width={40}
                        height={40}
                        className="object-cover rounded-lg"
                    />
                </div>
            ),
        },
        {
            header: "Name",
            render: (cat: any) => <span className="font-medium">{cat.name}</span>,
        },
        {
            header: "Slug",
            render: (cat: any) => <span className="text-xs">/{cat.slug}</span>,
        },
        {
            header: "Actions",
            render: (cat: any) => (
                <div className="flex gap-2 sm:gap-4 justify-center">
                    <Link href={`/admin/categories/${cat.id}`}>
                        <Button variant="naked" ><Pencil size={20} /></Button>
                    </Link>
                    <Button
                        variant="naked"
                        color="danger"
                        disabled={isDeleting === cat.id}
                        onClick={() => handleDelete(cat.id, cat.name)}
                    >
                        <Trash2 size={20} />
                    </Button>
                </div>
            ),
        },
    ];

    return <DataTable data={categories} columns={columns} />;
}
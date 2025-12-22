// components/admin/CategoryForm.tsx
"use client";
import { useForm } from "react-hook-form";

export function CategoryForm({ initialData }) {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: initialData || { name: '', slug: '', image: '' }
  });

  const onSubmit = async (data) => {
    // Call Server Action to save to Prisma
    await saveCategory(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium">Category Name</label>
        <input 
          {...register("name")} 
          onChange={(e) => setValue("slug", e.target.value.toLowerCase().replace(/ /g, '-'))}
          className="w-full border p-2 rounded" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Image URL</label>
        <input {...register("image")} className="w-full border p-2 rounded" />
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Save Category</button>
    </form>
  );
}
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { ArrowLeft, Save, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { upsertCategory } from "actions/category.actions";
import { json } from "node:stream/consumers";
import getSlug from "@lib/get-slug";
import { slugify } from "@lib/slugify";
import { Button } from "@components/ui";
import { CategorySchema } from "@lib/form-validator";
import AdminLayout from "../layout";

export default function CategoryFormPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const isEditMode = !!id && id !== "new";
const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    image: ""
  });

  const [loadingData, setLoadingData] = useState(isEditMode);

  useEffect(() => {

    // 2. ONLY fetch if we are actually in edit mode AND the slug exists
    if (isEditMode) {
      setLoadingData(true); // Ensure loader shows while re-fetching
      console.log("Fetched Category Data:");

      fetch(`/api/categories/${id}`)
        .then(res => res.json())
        .then(response => {
          // Your API returns { data: category }, so we look for response.data
          const categoryData = response.data;

          console.log("Found Category:", categoryData);

          if (categoryData) {
            setFormData({
              id: categoryData.id ?? "",
              name: categoryData.name ?? "",
              slug: getSlug(formData.name) ,
              image: categoryData.image ?? ""
            });
          }
        })
        .catch(err => console.error("Fetch error:", err))
        .finally(() => setLoadingData(false));

    } else {
      // If not edit mode, we aren't loading anything
      setLoadingData(false);
    }
  }, [isEditMode, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = CategorySchema.safeParse({
      ...formData,
      slug: slugify(formData.name)
    });

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return; // Stop submission
    }

    const response = await fetch(`/api/categories/${id}`, { method: 'put' });
    const result = await response.json();
    console.log("Delete Result:", result);
    if (result.success) {
      router.replace("/admin/categories");
      
    }
  };

  if (loadingData) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto py-10 bg-background">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="p-2 hover:bg-secondary rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold ">
            {isEditMode ? "Edit Category" : "New Category"}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-background rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Category Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="e.g. Home Decor"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
        </div>

        <div className="flex flex-row items-center">
          <span className=" text-sm font-semibold mr-2">URL Slug: </span>
          <span> {'/'+slugify(formData.name)}</span>
        </div>

        <div>
          <label className="block text-sm font-semibold text mb-2">Image URL</label>
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-dashed border-border overflow-hidden">
              {formData.image ? <img src={formData.image} className="object-cover w-full h-full" /> : <ImageIcon  />}
            </div>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm"
              placeholder="https://example.com/image.jpg"
            />
{errors.image && <p className="text-red-500 text-xs mt-1 font-medium">{errors.image}</p>}          </div>
        </div>

        <Button
          type="submit"
          className="w-full  py-3 transition flex items-center justify-center gap-2 "
        >
          {isEditMode ? "Save Changes" : "Create Category"}
        </Button>
      </form>
    </div>
  );
}

CategoryFormPage.Layout = AdminLayout;
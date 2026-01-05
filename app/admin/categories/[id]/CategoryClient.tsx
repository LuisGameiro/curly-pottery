"use client";

import React, { useState, useEffect, useTransition } from "react";
import { ArrowLeft, Save, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useParams } from 'next/navigation'
import { upsertCategory } from "actions/category.actions";
import { json } from "node:stream/consumers";
import getSlug from "@lib/get-slug";
import { slugify } from "@lib/slugify";
import { Button, Container, Input, Text } from "@components/ui";
import { CategorySchema } from "@lib/form-validator";
import AdminLayout from "../../layout";

export default function CategoryClient() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const isEditMode = !!id && id !== "new";
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    image: "",
  });

  const [loadingData, setLoadingData] = useState(isEditMode);
  const [preview, setPreview] = useState<any>(null);

const [loading, setLoading] = useState(false);
  useEffect(() => {
    // 2. ONLY fetch if we are actually in edit mode AND the slug exists
    if (isEditMode) {
      setLoadingData(true); // Ensure loader shows while re-fetching
      console.log("Fetched Category Data:");

      fetch(`/api/admin/categories/${id}`)
        .then((res) => res.json())
        .then((response) => {
          // Your API returns { data: category }, so we look for response.data
          const categoryData = response.data;

          console.log("Found Category:", categoryData);

          if (categoryData) {
            setFormData({
              id: categoryData.id ?? "",
              name: categoryData.name ?? "",
              slug: getSlug(formData.name),
              image: categoryData.image ?? "",
            });
          }
        })
        .catch((err) => console.error("Fetch error:", err))
        .finally(() => setLoadingData(false));
    } else {
      // If not edit mode, we aren't loading anything
      setLoadingData(false);
    }
  }, [isEditMode, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Run your Zod validation
    const validation = CategorySchema.safeParse({
      ...formData,
      slug: slugify(formData.name),
    });

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
 
      // // 3. Send the request
      // const response = await fetch(`/api/admin/categories/${id}`, {
      //   method: isEditMode ? "PUT" : "POST",
      //   body: data, // No JSON.stringify!
      //   // DO NOT set Content-Type header here
      // });

    const response = await fetch(`/api/admin/categories/${id}`, {
      method: isEditMode ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json", // Tell the server to expect JSON
      },
      body: JSON.stringify({
        name: formData.name,
        slug: slugify(formData.name),
        image: formData.image 
      }),
    });
    
      const result = await response.json();
          console.log("Found result:", result);

      if (result.success) {
        router.replace("/admin/categories");
        router.refresh(); // Ensure the list updates
      } else {
        setErrors({from:result.message || "Failed to save category"});
      }
    } catch (err) {
      console.error("Submit error:", err);
      setErrors({form: "An error occurred while saving."});
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview({ url: objectUrl, size: file.size / 1048576 });

      setSelectedFile(file);
    }
  };

  if (loadingData || loading)
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <Container>
      <header>
        <div className="flex items-center gap-4">
          <Link href="/admin/categories">
            <Button variant="naked">
              <ArrowLeft size={32} />
            </Button>
          </Link>
          <Text variant="heading">
            {isEditMode ? "Edit Category" : "New Category"}
          </Text>
        </div>
        <Button onClick={handleSubmit} type="submit" variant="secondary">
          {isEditMode ? "Save Changes" : "Create Category"}
        </Button>
      </header>
      <main>
        <form onSubmit={handleSubmit} className=" space-y-6 mx-auto md:w-8/12">
          <Input
            label="Category Name"
            error={errors.name}
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Home Decor"
          />

          <div className="flex gap-2 ">
            <span className="font-semibold">URL Slug:</span>
            <span className="text-muted-foreground">
              /{slugify(formData.name)}
            </span>
          </div>

          <div>
            <label className="block mb-2">Category Image</label>
            <div className="flex gap-4 items-center">
              <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border border-dashed border-border overflow-hidden shrink-0">
                {preview || formData.image ? (
                  <img
                    src={preview || formData.image}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <ImageIcon className="text-slate-400" />
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {preview
                    ? "New file selected" + { preview }
                    : formData.image
                      ? "Currently using saved URL"
                      : "No image selected"}
                </p>
              </div>
            </div>

            
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}
          </div>
        </form>
      </main>
    </Container>
  );
}

CategoryFormPage.Layout = AdminLayout;

// "use client";

// import React, { useState, useEffect } from "react";
// import { ArrowLeft, Loader2, ImageIcon } from "lucide-react";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import { slugify } from "@lib/slugify";
// import { Button, Container, Input, LoadingDots, Text } from "@components/ui";
// import AdminLayout from "../layout";

// export default function CategoryFormPage() {
//   const params = useParams();
//   const id = params?.id;
//   const isEditMode = !!id && id !== "new";

//   const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   const [loadingData, setLoadingData] = useState(isEditMode);

//   const [preview, setPreview] = useState<any>(null);

//   const [formData, setFormData] = useState({
//     id: "",
//     name: "",
//     slug: "",
//     image: ""
//   });

//   // useEffect(() => {
//   //   if (isEditMode) {
//   //     setLoadingData(true);
//   //     fetch(`/api/categories/${id}`)
//   //       .then(res => res.json())
//   //       .then(response => {
//   //         const categoryData = response.data;
//   //         if (categoryData) {
//   //           setFormData({
//   //             id: categoryData.id ?? "",
//   //             name: categoryData.name ?? "",
//   //             slug: categoryData.slug ?? "",
//   //             image: categoryData.image ?? ""
//   //           });
//   //         }
//   //       })
//   //       .catch(err => console.error("Fetch error:", err))
//   //       .finally(() => setLoadingData(false));
//   //   }
//   // }, [isEditMode, id]);

//   // // 2. Handle File selection and generate local preview

//   // useEffect(() => {
//   //   return () => {
//   //     if (preview) URL.revokeObjectURL(preview);
//   //   };
//   // }, [preview]);

//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   // };

//   // if (loadingData) return <div className="p-20 flex justify-center"><LoadingDots/></div>;

//   return (
//     <Container>
{
  /* 

//       <main>
//         <form onSubmit={handleSubmit} className="space-y-6 mx-auto md:w-8/12">
     



          
//         </form>
//       </main> */
}
//     </Container>
//   );
// }

// CategoryFormPage.layout = AdminLayout

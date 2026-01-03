import AdminLayout from "../layout";
import { Container, Text, Button, Input } from "@components/ui";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  Image as ImageIcon,
  X,
  Package,
  ArrowLeft,
  Link,
  Info,
  Percent,
  UploadCloud,
} from "lucide-react";
import { Detailtype, SizeNames } from "@lib/types/product";
import { getProductById } from "actions/product.actions";
import { GetServerSidePropsContext } from "next";
import { slugify } from "@lib/slugify";
import { getAllCategories } from "actions/category.actions";
import { skulify } from "@lib/skulify";
import InputTextArea from "@components/ui/Input/InputTextArea";
import InputSelect from "@components/ui/Input/InputSelect";
import { DiscountType } from "@lib/types/customer";

interface ProductFormProps {
  initialData?: any;
  categories: any[];
}

export async function getServerSideProps({
  params,
}: GetServerSidePropsContext) {
  const { id } = params;
  const product = await getProductById(id as string);
  const categories = await getAllCategories();

  return { props: { initialData: product || null, categories } };
}

export default function ProductForm({
  initialData,
  categories = [],
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  // Product State
  const [product, setProduct] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    requiresShipping: initialData?.requiresShipping ?? true,
    categoryIds: initialData?.categories?.map((c: any) => c.id) || [],
  });

  // Variants State
  const [variants, setVariants] = useState<any[]>(
    initialData?.variants || [
      {
        id: "temp-1",
        sku: "",
        price: 0,
        stock: 0,
        sizeName: "M",
        colorName: "",
        availableForSale: true,
        isExpanded: true,
      },
    ],
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `temp-${Date.now()}`,
        sku: "",
        price: 0,
        stock: 0,
        sizeName: "M",
        colorName: "",
        availableForSale: true,
        isExpanded: true,
      },
    ]);
  };

  const removeVariant = (id: string) => {
    if (variants.length === 1)
      return alert("Product must have at least one variant.");
    setVariants(variants.filter((v) => v.id !== id));
  };

  const toggleVariant = (id: string) => {
    setVariants(
      variants.map((v) =>
        v.id === id ? { ...v, isExpanded: !v.isExpanded } : v,
      ),
    );
  };

  const updateVariant = (id: string, field: string, value: any) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  // --- Details Handlers (Nested) ---
  const addDetail = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    const newDetails = [...(variant.details || []), { title: Detailtype.Materials, description: "" }];
    updateVariant(variantId, "details", newDetails);
  };

  const updateDetail = (variantId: string, index: number, field: string, value: string) => {
    const variant = variants.find((v) => v.id === variantId);
    const newDetails = variant.details.map((d: any, i: number) =>
      i === index ? { ...d, [field]: value } : d
    );
    updateVariant(variantId, "details", newDetails);
  };

  // --- Discount Handlers (Nested) ---
  const addDiscount = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    const newDiscounts = [...(variant.discounts || []), { code: "", type: "PERCENTAGE", value: 0, percentage: 0, amountSaved: 0 }];
    updateVariant(variantId, "discounts", newDiscounts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...product, variants };

    console.log(payload)
    const endpoint = isEditing
      ? `/api/admin/products/${initialData.id}`
      : "/api/admin/products";

    const res = await fetch(endpoint, {
      method:isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) router.push("/admin/products");
  };

  return (
    <Container>
      <header>
        <div>
          <div className="flex items-center gap-4">
            <Link href="/admin/categories">
              <Button variant="naked">
                <ArrowLeft size={32} />
              </Button>
            </Link>
            <Text variant="heading">
              {isEditing ? "Edit Product" : "New Product"}
            </Text>
          </div>
          <Text>Fill in the basic information and manage stock variants.</Text>
        </div>
        <Button type="submit" variant="secondary">
          <Save size={18} /> {isEditing ? "Update Product" : "Create Product"}
        </Button>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-accent-1 border rounded-xl p-6 shadow-sm space-y-4">
                <Text variant="subHeading">General Information</Text>
                <Input
                  label="Product Name"
                  error={errors.name}
                  required
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  placeholder="e.g. Home Decor"
                />


                <div className="gap-2">
                  <span className=" font-semibold mr-2">Slug: </span>
                  <span>{"/" + slugify(product.name)} </span>
                </div>

                <InputTextArea
                  label="Description"
                  error={errors.description}
                  required
                  value={product.description}
                  onChange={(e) =>
                    setProduct({ ...product, description: e.target.value })
                  }
                  placeholder="e.g. Home Decor"
                />
              </div>

              <div className="space-y-4">
                <div className="flex  items-center justify-between">
                  <Text variant='sectionHeading'>
                    Variants ({variants.length})
                  </Text>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addVariant}
                    className="gap-2"
                  >
                    <Plus size={16} /> Add Variant
                  </Button>
                </div>

                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="bg-accent-1 border rounded-xl overflow-hidden shadow-sm"
                  >
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer bg-secondary/20"
                      onClick={() => toggleVariant(variant.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Package size={16} />

                        <Text className="font-bold">
                          {skulify(product, variant) || "New Variant"}
                        </Text>
                        {/* <Text className="text-[10px] text-muted-foreground uppercase">
                            {variant.sizeName}{" "}
                            {variant.colorName && `• ${variant.colorName}`}
                          </Text> */}
                      </div>

                      <div className="flex items-center gap-3">
                        <Text className="text-sm font-medium">
                          £{variant.price}
                        </Text>
                        <Button
                          variant="naked"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVariant(variant.id);
                          }}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </Button>
                        {variant.isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </div>

                    {variant.isExpanded && (
                      <div className="p-6 border-t space-y-2">
                        <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">

                          <Input
                            type="number"
                            label='Price (£)'
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(
                                variant.id,
                                "price",
                                parseFloat(e.target.value),
                              )
                            }
                          />

                          <Input
                            label="Inventory Stock"
                            type="number"
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariant(
                                variant.id,
                                "stock",
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </div>

                        <>
                          <Text variant='subHeading'>Size Variant</Text>
                          <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">

                            <InputSelect
                              value={variant.sizeName}
                              options={Object.values(SizeNames)}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "sizeName",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </>

                        <>
                          <Text variant='subHeading'>Color Variant</Text>

                          <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">

                            <Input
                              label="Name"
                              value={variant.colorName}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "colorName",
                                  e.target.value,
                                )
                              }
                            />

                            <Input
                              label="Hex"
                              type='color'
                              className=" h-10 [&::-webkit-color-swatch-wrapper]:p-0 " value={variant.colorName}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "colorName",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </>

                        <div className="flex items-center justify-center gap-2 ">
                          <input
                            type="checkbox"
                            checked={variant.availableForSale}
                            className="h-6 w-6"
                            onChange={(e) =>
                              updateVariant(
                                variant.id,
                                "availableForSale",
                                e.target.checked,
                              )
                            }
                          />
                          <label className="font-semibold">
                            Available for Sale
                          </label>
                        </div>

                        {/* Details Sub-Section */}
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <Text variant="subHeading"> Technical Details</Text>
                            <Button variant="naked" size="sm" onClick={() => addDetail(variant.id)}><Plus size={14} /> Add Detail</Button>
                          </div>
                          {variant.details?.map((detail: any, dIdx: number) => (
                            <div key={dIdx} className="flex gap-2 items-start">
                              <InputSelect
                                className="w-1/3"
                                value={detail.title}
                                options={Object.values(Detailtype)}
                                onChange={(e) => updateDetail(variant.id, dIdx, "title", e.target.value)}
                              />
                              <Input
                                className="flex-1"
                                placeholder="Value (e.g. 100% Stoneware)"
                                value={detail.description}
                                onChange={(e) => updateDetail(variant.id, dIdx, "description", e.target.value)}
                              />
                              <Button variant="naked" color="danger" onClick={() => {
                                const newDetails = variant.details.filter((_: any, i: number) => i !== dIdx);
                                updateVariant(variant.id, "details", newDetails);
                              }}><Trash2 size={16} /></Button>
                            </div>
                          ))}
                        </div>

                        {/* Discounts Sub-Section */}
                        <div className="space-y-4 bg-green-50/50 p-4 rounded-lg ">
                          <div className="flex justify-between items-center">

                            <Text variant="subHeading">Discounts & Promos</Text>

                            <Button type="button" variant="naked" size="sm" onClick={() => addDiscount(variant.id)} className="text-green-700"><Plus size={14} /> Add Promo</Button>
                          </div>
                          {variant.discounts?.map((disc: any, discIdx: number) => (
                            <div key={discIdx} className="grid grid-cols-4 gap-2 items-end">
                              <Input label="Code" value={disc.code} onChange={(e) => {
                                const newD = [...variant.discounts];
                                newD[discIdx].code = e.target.value;
                                updateVariant(variant.id, "discounts", newD);
                              }} />
                              <InputSelect
                                label="Type"
                                value={disc.type}
                                options={Object.values(DiscountType)}
                                onChange={(e) => {
                                  const newD = [...variant.discounts];
                                  newD[discIdx].type = (e.target.value);
                                  updateVariant(variant.id, "discounts", newD);
                                }} />
                              {(disc.type === DiscountType.PERCENTAGE) ?

                                <Input label="%" type="number" value={disc.percentage} onChange={(e) => {
                                  const newD = [...variant.discounts];
                                  newD[discIdx].percentage = parseFloat(e.target.value);
                                  updateVariant(variant.id, "discounts", newD);
                                }} /> :
                                <Input label="Fixed Off" type="number" value={disc.value} onChange={(e) => {
                                  const newD = [...variant.discounts];
                                  newD[discIdx].value = parseFloat(e.target.value);
                                  updateVariant(variant.id, "discounts", newD);
                                }} />
                              }
                              <Button variant="naked" className="text-red-500 mb-1" onClick={() => {
                                const newD = variant.discounts.filter((_: any, i: number) => i !== discIdx);
                                updateVariant(variant.id, "discounts", newD);
                              }}><Trash2 size={16} /></Button>
                            </div>
                          ))}
                        </div>

                        {/* Image */}
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">

                          {variant.images && variant.images.length > 0 && (
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                              {variant.images.map((img: string, i: number) => (
                                <div key={i} className="relative aspect-square group border rounded-lg overflow-hidden bg-slate-100">
                                  <img
                                    src={img}
                                    alt={`Variant ${i}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = variant.images.filter((_: any, index: number) => index !== i);
                                      updateVariant(variant.id, "images", newImages);
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>

                          )}
                          <div
                            className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                            onClick={() => {
                              const url = prompt("Enter image URL:");
                              if (url) updateVariant(variant.id, "images", [url]);
                            }}
                          >
                            <UploadCloud className="text-slate-300 mb-2" size={32} />
                            <Text className="text-[10px] font-bold uppercase text-slate-400">No images for this variant</Text>
                          </div>
                        </div>
                      </div>

                    )}
                  </div>
                ))}
              </div>


            </div>
            {/* <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">SKU</label>
                          <Input value={variant.sku? variant.sku : skulify(product)} onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)} />
                        </div> */}
            <div className="space-y-6">
              <div className="bg-accent-1 border rounded-xl p-6 shadow-sm">
                <Text className="font-bold border-b pb-2 mb-4 block">
                  Organization
                </Text>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={product.requiresShipping}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          requiresShipping: e.target.checked,
                        })
                      }
                    />
                    <label className="text-sm">Requires Shipping</label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            const ids = product.categoryIds.includes(cat.id)
                              ? product.categoryIds.filter(
                                (id) => id !== cat.id,
                              )
                              : [...product.categoryIds, cat.id];
                            setProduct({ ...product, categoryIds: ids });
                          }}
                          className={`px-3 py-1 rounded-full text-xs border transition ${product.categoryIds.includes(cat.id)
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <Text className="font-bold border-b pb-2 mb-4 block">
                  Product Images
                </Text>
                <div className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition cursor-pointer">
                  <Plus size={24} />
                  <span className="text-[10px] font-bold uppercase mt-2">
                    Upload Image
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </Container>
  );
}

ProductForm.Layout = AdminLayout;

"use client";

import { Container, Text, Button, Input } from "@components/ui";
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
  UploadCloud,
} from "lucide-react";
import { Detailtype, SizeNames } from "@lib/types/product";
import { slugify } from "@lib/slugify";
import { skulify } from "@lib/skulify";
import InputTextArea from "@components/ui/Input/InputTextArea";
import InputSelect from "@components/ui/Input/InputSelect";
import { DiscountType } from "@lib/types/customer";
import { upsertProduct } from "actions/product.actions";
import InputImage from "@components/ui/Input/InputImage";
import Loading from "app/loading";
import InputCheck from "@components/ui/Input/InputCheck";

interface ProductFormProps {
  initialData?: any;
  categories: any[];
}

export default function ProductClient({
  initialData,
  categories = [],
}: ProductFormProps) {
  const isEditing = !!initialData;

  const [product, setProduct] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    requiresShipping: initialData?.requiresShipping ?? true,
    categoryIds: initialData?.categories?.map((c: any) => c.id) || [],
  });

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
    ]
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [gallery, setGallery] = useState<{ files: File[]; previews: string[] }>(
    {
      files: [initialData.image],
      previews: [initialData.image],
    }
  );
  const [loading, setLoading] = useState(false);

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `temp-${Date.now()}`,
        sku: "",
        price: 0,
        stock: 0,
        images: [],
        previews: [],
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
        v.id === id ? { ...v, isExpanded: !v.isExpanded } : v
      )
    );
  };

  const updateVariant = (id: string, field: string, value: any) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const addDetail = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    const newDetails = [
      ...(variant.details || []),
      { title: Detailtype.Materials, description: "" },
    ];
    updateVariant(variantId, "details", newDetails);
  };

  const updateDetail = (
    variantId: string,
    index: number,
    field: string,
    value: string
  ) => {
    const variant = variants.find((v) => v.id === variantId);
    const newDetails = variant.details.map((d: any, i: number) =>
      i === index ? { ...d, [field]: value } : d
    );
    updateVariant(variantId, "details", newDetails);
  };

  const addDiscount = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    const newDiscounts = [
      ...(variant.discounts || []),
      { code: "", type: "PERCENTAGE", value: 0, percentage: 0, amountSaved: 0 },
    ];
    updateVariant(variantId, "discounts", newDiscounts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { ...product, variants };

    const result = await upsertProduct(payload);
    // console.log(payload);
    // const endpoint = isEditing
    //   ? `/api/admin/products/${initialData.id}`
    //   : "/api/admin/products";

    // const res = await fetch(endpoint, {
    //   method: isEditing ? "PUT" : "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });

    //if (res.ok) router.push("/admin/products");
  };

  if (loading) return Loading();

  return (
    <Container>
      <header>
        <Link
          href="/admin/products"
          className="flex items-center gap-2 text-muted-foreground hover:text-accent-6 mb-4 transition"
        >
          <ArrowLeft size={16} /> Back to products
        </Link>

        <div className="flex items-center justify-between">
          <Text variant="heading">
            {isEditing ? "Edit Product" : "New Product"}
          </Text>
          <Button type="submit" variant="slim" disabled={loading}>
            {isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Container variant="box" className="lg:col-span-2 space-y-">
              <Text variant="boxTitle">General Information</Text>
              <div className="space-y-4">
                <Input
                  label="Product Name"
                  error={errors.name}
                  required
                  type="text"
                  value={product.name}
                  onChange={(e) =>
                    setProduct({ ...product, name: e.target.value })
                  }
                  placeholder="e.g. Home Decor"
                />

                <div className="gap-2">
                  <span className=" font-semibold mr-2">Slug: </span>
                  <span>{"/" + slugify(product.name)} </span>
                </div>

                <InputTextArea
                  label="Description"
                  className="flex h-40"
                  error={errors.description}
                  required
                  value={product.description}
                  onChange={(e) =>
                    setProduct({ ...product, description: e.target.value })
                  }
                  placeholder="e.g. Home Decor"
                />
              </div>
            </Container>

            <div className="space-y-6">
              <Container variant="box">
                <Text variant="boxTitle">Organization</Text>
                <div className="space-y-4">
                  <InputCheck
                    label="Requires Shipping"
                    checked={product.requiresShipping}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        requiresShipping: e.target.checked,
                      })
                    }
                  />
                  <div className="space-y-2">
                    {/* <InputSelect options={categories}></InputSelect>    */}
                    <label>Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            const ids = product.categoryIds.includes(cat.id)
                              ? product.categoryIds.filter(
                                  (id) => id !== cat.id
                                )
                              : [...product.categoryIds, cat.id];
                            setProduct({ ...product, categoryIds: ids });
                          }}
                          className={`px-3 py-1 rounded-full text-xs border transition ${
                            product.categoryIds.includes(cat.id)
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
              </Container>

              <Container variant="box">
                <Text variant="boxTitle">Product Image</Text>
                <InputImage
                  multiple={false}
                  images={gallery.files}
                  previews={gallery.previews}
                  onImagesChange={setGallery}
                  error={errors.images}
                />
              </Container>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text variant="sectionHeading">Variants ({variants.length})</Text>
              <Button
                type="button"
                variant="slim"
                onClick={addVariant}
                className="gap-2"
              >
                <Plus size={16} /> Add Variant
              </Button>
            </div>

            {variants.map((variant, index) => (
              <Container variant="box" key={variant.id} className="p-0">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer bg-secondary/20 rounded-xl"
                  onClick={() => toggleVariant(variant.id)}
                >
                  <div className="flex items-center gap-4">
                    <Package size={16} />

                    <Text className="font-bold">
                      {skulify(product, variant) || "New Variant"}
                    </Text>
                  </div>

                  <div className="flex items-center gap-4">
                    <Text className="text-sm font-medium">
                      £{variant.price}
                    </Text>
                    <Button
                      variant="naked"
                      type="button"
                      color="danger"
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
                  <div className="p-6 space-y-4">
                    <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        type="number"
                        label="Price (£)"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(
                            variant.id,
                            "price",
                            parseFloat(e.target.value)
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
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div>
                      <Text variant="subHeading">Size Variant</Text>
                      <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputSelect
                          value={variant.sizeName}
                          options={Object.values(SizeNames)}
                          onChange={(e) =>
                            updateVariant(
                              variant.id,
                              "sizeName",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Text variant="subHeading">Color Variant</Text>

                      <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Name"
                          value={variant.colorName}
                          onChange={(e) =>
                            updateVariant(
                              variant.id,
                              "colorName",
                              e.target.value
                            )
                          }
                        />

                        <Input
                          label="Hex"
                          type="color"
                          className=" h-10 [&::-webkit-color-swatch-wrapper]:p-0 "
                          value={variant.colorName}
                          onChange={(e) =>
                            updateVariant(
                              variant.id,
                              "colorName",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <InputCheck
                      label="Available for Sale"
                      checked={variant.availableForSale}
                      className="h-6 w-6"
                      onChange={(e) =>
                        updateVariant(
                          variant.id,
                          "availableForSale",
                          e.target.checked
                        )
                      }
                    />

                    {/* details */}
                    <div className="space-y-4 bg-primary/90 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <Text variant="subHeading"> Technical Details</Text>
                        <Button
                          variant="naked"
                          size="sm"
                          onClick={() => addDetail(variant.id)}
                          color="success"
                        >
                          <Plus size={14} /> Add Detail
                        </Button>
                      </div>

                      {variant.details?.map((detail: any, dIdx: number) => (
                        <div key={dIdx} className="flex gap-2 items-center">
                          <InputSelect
                            className="w-1/3"
                            value={detail.title}
                            options={Object.values(Detailtype)}
                            onChange={(e) =>
                              updateDetail(
                                variant.id,
                                dIdx,
                                "title",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            className="flex-1"
                            placeholder="Value (e.g. 100% Stoneware)"
                            value={detail.description}
                            onChange={(e) =>
                              updateDetail(
                                variant.id,
                                dIdx,
                                "description",
                                e.target.value
                              )
                            }
                          />
                          <Button
                            variant="naked"
                            color="danger"
                            onClick={() => {
                              const newDetails = variant.details.filter(
                                (_: any, i: number) => i !== dIdx
                              );
                              updateVariant(variant.id, "details", newDetails);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* discounts */}
                    <div className="space-y-4 bg-green-50/50 p-4 rounded-lg ">
                      <div className="flex justify-between items-center">
                        <Text variant="subHeading">Discounts & Promos</Text>

                        <Button
                          variant="naked"
                          size="sm"
                          onClick={() => addDiscount(variant.id)}
                          color="success"
                        >
                          <Plus size={14} /> Add Discount
                        </Button>
                      </div>
                      {variant.discounts?.map((disc: any, discIdx: number) => (
                        <div className="flex gap-2 items-center" key={discIdx}>
                            <Input
                              label="Code"
                              placeholder="Discount aplly without code"
                              value={disc.code}
                              onChange={(e) => {
                                const newD = [...variant.discounts];
                                newD[discIdx].code = e.target.value;
                                updateVariant(variant.id, "discounts", newD);
                              }}
                            />
                            <InputSelect
                              label="Type"
                              value={disc.type}
                              options={Object.values(DiscountType)}
                              onChange={(e) => {
                                const newD = [...variant.discounts];
                                newD[discIdx].type = e.target.value;
                                updateVariant(variant.id, "discounts", newD);
                              }}
                            />
                            {disc.type === DiscountType.PERCENTAGE ? (
                              <Input
                                label="%"
                                type="number"
                                value={disc.percentage}
                                onChange={(e) => {
                                  const newD = [...variant.discounts];
                                  newD[discIdx].percentage = parseFloat(
                                    e.target.value
                                  );
                                  updateVariant(variant.id, "discounts", newD);
                                }}
                              />
                            ) : (
                              <Input
                                label="Fixed Off"
                                type="number"
                                value={disc.value}
                                onChange={(e) => {
                                  const newD = [...variant.discounts];
                                  newD[discIdx].value = parseFloat(
                                    e.target.value
                                  );
                                  updateVariant(variant.id, "discounts", newD);
                                }}
                              />
                            )}
                          <Button
                            variant="naked"
                            color='danger'
                            onClick={() => {
                              const newD = variant.discounts.filter(
                                (_: any, i: number) => i !== discIdx
                              );
                              updateVariant(variant.id, "discounts", newD);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <InputImage
                      label="Variant Images"
                      multiple={true}
                      images={gallery.files}
                      previews={gallery.previews}
                      onImagesChange={setGallery}
                      error={errors.images}
                    />
                  </div>
                )}
              </Container>
            ))}
          </div>
        </form>
      </main>
    </Container>
  );
}

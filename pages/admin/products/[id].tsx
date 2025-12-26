import AdminLayout from "../layout";
import { Container, Text, Button, Input } from "@components/ui";
import { useRouter } from "next/router";
import { useState } from "react";
import { 
  Plus, Trash2, ChevronDown, ChevronUp, 
  Save, Image as ImageIcon, X, Package 
} from "lucide-react";
import { SizeNames } from "@lib/types/product";
import { getProductById } from "actions/product.actions";
import { GetServerSidePropsContext } from "next";

interface ProductFormProps {
  initialData?: any; // If editing
  categories: any[]; // To select categories
}

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const { id } = params;
  const product = await getProductById(id as string);

  return { props: { initialData: product || null } };
}


export default function ProductForm({ initialData, categories=[] }: ProductFormProps) {
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
      { id: 'temp-1', sku: "", price: 0, stock: 0, sizeName: "M", colorName: "", availableForSale: true, isExpanded: true }
    ]
  );

  const addVariant = () => {
    setVariants([...variants, { 
      id: `temp-${Date.now()}`, 
      sku: "", price: 0, stock: 0, 
      sizeName: "M", colorName: "", 
      availableForSale: true, isExpanded: true 
    }]);
  };

  const removeVariant = (id: string) => {
    if (variants.length === 1) return alert("Product must have at least one variant.");
    setVariants(variants.filter(v => v.id !== id));
  };

  const toggleVariant = (id: string) => {
    setVariants(variants.map(v => v.id === id ? { ...v, isExpanded: !v.isExpanded } : v));
  };

  const updateVariant = (id: string, field: string, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...product, variants };
    
    const endpoint = isEditing ? `/api/products/${initialData.id}` : "/api/products";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) router.push("/admin/products");
  };

  return (
    <Container className="container mx-auto px-4 py-10 max-w-5xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-6">
          <div>
            <Text variant="heading">{isEditing ? "Edit Product" : "New Product"}</Text>
            <Text>Fill in the basic information and manage stock variants.</Text>
          </div>
          <Button type="submit" className="flex items-center gap-2">
            <Save size={18} /> {isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
              <Text className="font-bold border-b pb-2 mb-4 block">General Information</Text>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Product Name</label>
                  <Input 
                    value={product.name} 
                    onChange={(e) => setProduct({...product, name: e.target.value})} 
                    placeholder="e.g. Handmade Ceramic Bowl" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Slug</label>
                  <Input 
                    value={product.slug} 
                    onChange={(e) => setProduct({...product, slug: e.target.value})} 
                    placeholder="ceramic-bowl" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                <textarea 
                  className="w-full min-h-[120px] p-3 rounded-md border text-sm" 
                  value={product.description}
                  onChange={(e) => setProduct({...product, description: e.target.value})}
                />
              </div>
            </div>

            {/* Variants Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text className="font-bold">Variants ({variants.length})</Text>
                <Button type="button" variant="secondary" size="sm" onClick={addVariant} className="flex items-center gap-2">
                  <Plus size={16} /> Add Variant
                </Button>
              </div>

              {variants.map((variant, index) => (
                <div key={variant.id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  {/* Variant Header */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50"
                    onClick={() => toggleVariant(variant.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-200 p-2 rounded text-slate-500"><Package size={16} /></div>
                      <div>
                        <Text className="text-sm font-bold">{variant.sku || "New Variant"}</Text>
                        <Text className="text-[10px] text-muted-foreground uppercase">{variant.sizeName} {variant.colorName && `• ${variant.colorName}`}</Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Text className="text-sm font-medium">£{variant.price}</Text>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeVariant(variant.id); }} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                      </button>
                      {variant.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Variant Body */}
                  {variant.isExpanded && (
                    <div className="p-6 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">SKU</label>
                        <Input value={variant.sku} onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Price</label>
                        <Input type="number" value={variant.price} onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Inventory Stock</label>
                        <Input type="number" value={variant.stock} onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Size</label>
                        <select 
                          className="w-full p-2 border rounded-md text-sm"
                          value={variant.sizeName}
                          onChange={(e) => updateVariant(variant.id, 'sizeName', e.target.value)}
                        >
                          {Object.values(SizeNames).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Color Name</label>
                        <Input value={variant.colorName} onChange={(e) => updateVariant(variant.id, 'colorName', e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input 
                          type="checkbox" 
                          checked={variant.availableForSale} 
                          onChange={(e) => updateVariant(variant.id, 'availableForSale', e.target.checked)} 
                        />
                        <label className="text-xs font-bold uppercase">Available for Sale</label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <div className="bg-white border rounded-xl p-6 shadow-sm">
                <Text className="font-bold border-b pb-2 mb-4 block">Organization</Text>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={product.requiresShipping} 
                      onChange={(e) => setProduct({...product, requiresShipping: e.target.checked})} 
                    />
                    <label className="text-sm">Requires Shipping</label>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            const ids = product.categoryIds.includes(cat.id) 
                              ? product.categoryIds.filter(id => id !== cat.id)
                              : [...product.categoryIds, cat.id];
                            setProduct({...product, categoryIds: ids});
                          }}
                          className={`px-3 py-1 rounded-full text-xs border transition ${
                            product.categoryIds.includes(cat.id) 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-white text-slate-600 hover:bg-slate-50'
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
                <Text className="font-bold border-b pb-2 mb-4 block">Product Images</Text>
                <div className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition cursor-pointer">
                  <Plus size={24} />
                  <span className="text-[10px] font-bold uppercase mt-2">Upload Image</span>
                </div>
             </div>
          </div>
        </div>
      </form>
    </Container>
  );
}

ProductForm.Layout = AdminLayout;
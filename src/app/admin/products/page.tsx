"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/Button";
import { Input, TextArea } from "@/components/Input";
import { Skeleton } from "@/components/Skeleton";
import { safeFetchJson } from "@/lib/api-client";
import type { Category, Product, ProductVariant } from "@/lib/types";
import { getProductImage, getProductStock, getProductVariants } from "@/lib/product-utils";
import { formatCurrency } from "@/lib/whatsapp";

type VariantDraft = ProductVariant & { imagesText: string; sizesText: string };
type VariantPayload = Omit<ProductVariant, "id"> & { id?: string };

const emptyProduct = {
  name: "",
  description: "",
  price: 0,
  discountPrice: "",
  categoryId: "",
  featured: false,
  active: true
};

function toVariantDraft(variant?: Partial<ProductVariant>): VariantDraft {
  return {
    id: variant?.id || `draft-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
    colorName: variant?.colorName || "Onyx Black",
    colorHex: variant?.colorHex || "#1A1A1A",
    images: variant?.images || [],
    imagesText: variant?.images?.join(", ") || "",
    sizes: variant?.sizes || ["S", "M", "L", "XL"],
    sizesText: variant?.sizes?.join(", ") || "S, M, L, XL",
    stock: variant?.stock || 0,
    sku: variant?.sku || "",
    priceOverride: variant?.priceOverride,
    active: variant?.active !== false
  };
}

function list(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [variants, setVariants] = useState<VariantDraft[]>([toVariantDraft()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setLoading(true);
      const [nextProducts, nextCategories] = await Promise.all([
        safeFetchJson<Product[]>("/api/products"),
        safeFetchJson<Category[]>("/api/categories")
      ]);
      setProducts(nextProducts);
      setCategories(nextCategories);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function edit(product: Product) {
    setError("");
    setSuccess("");
    setEditing(product);
    setVariants(getProductVariants(product).map(toVariantDraft));
  }

  function resetForm(form?: HTMLFormElement) {
    setError("");
    setSuccess("");
    setEditing(null);
    setVariants([toVariantDraft()]);
    form?.reset();
  }

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((variant, currentIndex) => (currentIndex === index ? { ...variant, ...patch } : variant)));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    const cleanVariants: VariantPayload[] = variants.map((variant) => ({
      ...(variant.id.startsWith("draft-") ? {} : { id: variant.id }),
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      images: list(variant.imagesText),
      sizes: list(variant.sizesText),
      stock: Number(variant.stock || 0),
      sku: variant.sku || undefined,
      priceOverride: variant.priceOverride ? Number(variant.priceOverride) : undefined,
      active: variant.active !== false
    }));

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await safeFetchJson<Product>(editing ? `/api/products/${editing.id}` : "/api/products", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          price: Number(payload.price),
          discountPrice: payload.discountPrice ? Number(payload.discountPrice) : undefined,
          featured: form.get("featured") === "on",
          active: form.get("active") === "on",
          variants: cleanVariants
        })
      });
      const message = editing ? "Product saved." : "Product added.";
      resetForm(formElement);
      setSuccess(message);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      setDeletingId(id);
      setError("");
      setSuccess("");
      await safeFetchJson<{ ok: boolean }>(`/api/products/${id}`, { method: "DELETE" });
      setSuccess("Product deleted.");
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  const defaults = editing ? { ...editing, discountPrice: editing.discountPrice || "" } : { ...emptyProduct, categoryId: categories[0]?.id || "" };

  return (
    <AdminLayout title="Products">
      {(error || success) && (
        <div className="mb-5 grid gap-3">
          {error && <AdminFeedback type="error" message={error} onDismiss={() => setError("")} />}
          {success && <AdminFeedback type="success" message={success} onDismiss={() => setSuccess("")} />}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form key={editing?.id || "new-product"} onSubmit={submit} className="grid gap-4 border border-champagne/30 bg-ivory p-5 shadow-sm">
          <h2 className="serif-title text-3xl text-aubergine">{editing ? "Edit Product" : "Add Product"}</h2>
          <Input label="Product name" name="name" required defaultValue={defaults.name} />
          <TextArea label="Description" name="description" required defaultValue={defaults.description} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Base price" name="price" type="number" required defaultValue={defaults.price} />
            <Input label="Discount price" name="discountPrice" type="number" defaultValue={defaults.discountPrice} />
          </div>
          <label className="grid gap-2 text-sm text-onyx/80">
            <span className="fine-label text-aubergine">Category</span>
            <select name="categoryId" required defaultValue={defaults.categoryId} className="min-h-12 border border-smoke bg-ivory px-4">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>

          <div className="grid gap-3 border-t border-champagne/25 pt-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="fine-label text-aubergine">Color Variants</h3>
              <button type="button" onClick={() => setVariants((current) => [...current, toVariantDraft()])} className="inline-flex min-h-10 items-center gap-2 border border-champagne/40 px-3 text-sm text-aubergine">
                <Plus size={16} /> Add Variant
              </button>
            </div>
            <AnimatePresence initial={false}>
              {variants.map((variant, index) => (
                <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -18 }} key={variant.id} className="grid gap-4 border border-champagne/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="serif-title text-2xl text-aubergine">Variant {index + 1}</p>
                    {variants.length > 1 && (
                      <button type="button" onClick={() => setVariants((current) => current.filter((_, currentIndex) => currentIndex !== index))} className="grid h-10 w-10 place-items-center border border-red-300 text-red-700" aria-label="Delete variant">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                    <Input label="Color name" value={variant.colorName} onChange={(event) => updateVariant(index, { colorName: event.target.value })} />
                    <label className="grid gap-2 text-sm text-onyx/80">
                      <span className="fine-label text-aubergine">Color</span>
                      <input type="color" value={variant.colorHex} onChange={(event) => updateVariant(index, { colorHex: event.target.value })} className="h-12 w-full border border-smoke bg-ivory p-1" />
                    </label>
                  </div>
                  <Input label="Hex code" value={variant.colorHex} onChange={(event) => updateVariant(index, { colorHex: event.target.value })} />
                  <TextArea label="Variant images URLs comma separated" value={variant.imagesText} onChange={(event) => updateVariant(index, { imagesText: event.target.value })} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input label="Available sizes" value={variant.sizesText} onChange={(event) => updateVariant(index, { sizesText: event.target.value })} />
                    <Input label="Stock" type="number" value={variant.stock} onChange={(event) => updateVariant(index, { stock: Number(event.target.value) })} />
                    <Input label="Price override" type="number" value={variant.priceOverride || ""} onChange={(event) => updateVariant(index, { priceOverride: event.target.value ? Number(event.target.value) : undefined })} />
                  </div>
                  <Input label="SKU" value={variant.sku || ""} onChange={(event) => updateVariant(index, { sku: event.target.value })} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-aubergine">
            <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={defaults.featured} /> Featured product</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={defaults.active} /> Active</label>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Save Product" : "Add Product"}</Button>
            {editing && <Button type="button" variant="secondary" onClick={() => resetForm()} disabled={saving}>Cancel</Button>}
          </div>
        </form>

        <div className="grid content-start gap-4">
          {loading && Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full border border-champagne/20" />)}
          {!loading && products.map((product) => {
            const variantsForProduct = getProductVariants(product);
            return (
              <motion.div layout key={product.id} className="grid gap-4 border border-champagne/30 bg-ivory p-4 md:grid-cols-[96px_1fr_auto]">
                <img src={getProductImage(product, variantsForProduct[0])} alt={product.name} className="h-24 w-24 object-cover" />
                <div>
                  <h3 className="font-semibold text-aubergine">{product.name}</h3>
                  <p className="text-sm text-onyx/60">{formatCurrency(product.discountPrice || product.price)} / Stock {getProductStock(product)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {variantsForProduct.map((variant) => <span key={variant.id} title={variant.colorName} className="h-4 w-4 border border-champagne/50" style={{ backgroundColor: variant.colorHex }} />)}
                  </div>
                  <p className="mt-2 text-xs text-onyx/50">{product.active ? "Active" : "Inactive"} {product.featured ? "/ Featured" : ""}</p>
                </div>
                <div className="flex gap-2 md:flex-col">
                  <button disabled={saving || deletingId === product.id} onClick={() => edit(product)} className="border border-champagne/40 px-3 py-2 text-sm text-aubergine disabled:cursor-not-allowed disabled:opacity-60">Edit</button>
                  <button disabled={deletingId === product.id} onClick={() => remove(product.id)} className="border border-red-300 px-3 py-2 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-60">{deletingId === product.id ? "Deleting..." : "Delete"}</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

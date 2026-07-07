"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminEmptyState, AdminLayout, AdminStatusBadge } from "@/components/AdminLayout";
import { Button } from "@/components/Button";
import { Input, TextArea } from "@/components/Input";
import { Skeleton } from "@/components/Skeleton";
import { safeFetchJson } from "@/lib/api-client";
import { normalizeProductPayload } from "@/lib/product-validation";
import type { Category, Product, ProductVariant } from "@/lib/types";
import { getProductImage, getProductStock, getProductVariants } from "@/lib/product-utils";
import { formatCurrency } from "@/lib/whatsapp";

type VariantDraft = Omit<ProductVariant, "stock" | "priceOverride"> & {
  sizesText: string;
  stock: number | string;
  priceOverride?: number | string;
};

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
    images: cleanImageUrls(variant?.images || []),
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

function cleanImageUrls(images: string[]) {
  return images.map((image) => image.trim()).filter(Boolean);
}

function removeImageUrl(images: string[], removeIndex: number) {
  return cleanImageUrls(images).filter((_, index) => index !== removeIndex);
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-700">{message}</p>;
}

function VariantImagePreview({ url, alt }: { url: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="grid aspect-square w-full place-items-center bg-linen p-3 text-center text-xs text-onyx/55">
        Image unavailable
      </div>
    );
  }

  return <img src={url} alt={alt} onError={() => setFailed(true)} className="aspect-square w-full object-cover" />;
}

function FormSection({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-aubergine/25 pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="fine-label text-aubergine">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadingVariantId, setUploadingVariantId] = useState<string | null>(null);

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
    setFieldErrors({});
    setEditing(product);
    setVariants(getProductVariants(product).map(toVariantDraft));
  }

  function resetForm(form?: HTMLFormElement) {
    setError("");
    setSuccess("");
    setFieldErrors({});
    setEditing(null);
    setVariants([toVariantDraft()]);
    form?.reset();
  }

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((variant, currentIndex) => (currentIndex === index ? { ...variant, ...patch } : variant)));
  }

  function clearVariantImageError(index: number) {
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[`variants.${index}.images`];
      return next;
    });
  }

  async function uploadVariantImage(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const variantId = variants[index]?.id;
    if (!variantId) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingVariantId(variantId);
      setError("");
      setSuccess("");
      const result = await safeFetchJson<{ url: string }>("/api/admin/upload/product-image", {
        method: "POST",
        body: formData
      });
      setVariants((current) =>
        current.map((variant, currentIndex) =>
          currentIndex === index ? { ...variant, images: [...cleanImageUrls(variant.images), result.url] } : variant
        )
      );
      clearVariantImageError(index);
      setSuccess("Image uploaded. Save the product to keep it.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
    } finally {
      setUploadingVariantId(null);
      event.target.value = "";
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    const cleanVariants = variants.map((variant) => ({
      ...(variant.id.startsWith("draft-") ? {} : { id: variant.id }),
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      images: cleanImageUrls(variant.images),
      sizes: list(variant.sizesText),
      stock: variant.stock,
      sku: variant.sku,
      priceOverride: variant.priceOverride,
      active: variant.active !== false
    }));
    const validation = normalizeProductPayload({
      ...payload,
      featured: form.get("featured") === "on",
      active: form.get("active") === "on",
      variants: cleanVariants
    });

    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      setError(validation.error);
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      setFieldErrors({});
      await safeFetchJson<Product>(editing ? `/api/products/${editing.id}` : "/api/products", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.product)
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
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <form key={editing?.id || "new-product"} onSubmit={submit} noValidate className="min-w-0 border border-aubergine/30 bg-ivory p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-aubergine/25 pb-5">
            <div>
              <p className="fine-label text-plum">{editing ? "Editing Product" : "New Product"}</p>
              <h2 className="serif-title mt-1 text-4xl leading-tight text-aubergine">{editing ? "Edit Product" : "Add Product"}</h2>
            </div>
            {editing && <AdminStatusBadge tone="neutral">Draft Edits</AdminStatusBadge>}
          </div>

          <div className="grid gap-7">
            <FormSection title="Product Details">
              <div className="grid gap-4">
                <div className="grid gap-1">
                  <Input label="Product name" name="name" required defaultValue={defaults.name} aria-invalid={Boolean(fieldErrors.name)} />
                  <FieldError message={fieldErrors.name} />
                </div>
                <div className="grid gap-1">
                  <TextArea
                    label="Description"
                    name="description"
                    required
                    defaultValue={defaults.description}
                    aria-invalid={Boolean(fieldErrors.description)}
                    className="min-h-36 resize-y"
                  />
                  <FieldError message={fieldErrors.description} />
                </div>
              </div>
            </FormSection>

            <FormSection title="Pricing">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid min-w-0 gap-1">
                  <Input label="Base price" name="price" type="number" min="0" step="0.01" required defaultValue={defaults.price} aria-invalid={Boolean(fieldErrors.price)} />
                  <FieldError message={fieldErrors.price} />
                </div>
                <div className="grid min-w-0 gap-1">
                  <Input
                    label="Discount price"
                    name="discountPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={defaults.discountPrice}
                    aria-invalid={Boolean(fieldErrors.discountPrice)}
                  />
                  <FieldError message={fieldErrors.discountPrice} />
                </div>
              </div>
            </FormSection>

            <FormSection title="Category">
              <label className="grid gap-2 text-sm text-onyx/80">
                <span className="fine-label text-aubergine">Category</span>
                <select
                  name="categoryId"
                  required
                  defaultValue={defaults.categoryId}
                  aria-invalid={Boolean(fieldErrors.categoryId)}
                  className="min-h-12 w-full border border-smoke bg-ivory px-4 text-onyx outline-none transition focus:border-aubergine focus:ring-2 focus:ring-deepPurple/20"
                >
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                <FieldError message={fieldErrors.categoryId} />
              </label>
            </FormSection>

            <FormSection
              title="Variants"
              action={
                <button
                  type="button"
                  onClick={() => setVariants((current) => [...current, toVariantDraft()])}
                  className="inline-flex min-h-10 items-center gap-2 border border-aubergine/50 px-3 text-sm font-semibold text-aubergine transition hover:border-aubergine/40 hover:bg-softPurple/10"
                >
                  <Plus size={16} /> Add Variant
                </button>
              }
            >
              <FieldError message={fieldErrors.variants} />
              <div className="grid gap-5">
                <AnimatePresence initial={false}>
                  {variants.map((variant, index) => {
                    const imageUrls = cleanImageUrls(variant.images);
                    const isUploading = uploadingVariantId === variant.id;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -18 }}
                        key={variant.id}
                        className="min-w-0 border border-aubergine/35 bg-linen/20 p-4 shadow-sm sm:p-5"
                      >
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-aubergine/25 pb-4">
                          <div className="flex items-center gap-3">
                            <span className="grid h-8 w-8 place-items-center border border-aubergine/50 bg-ivory text-sm font-semibold text-aubergine">{index + 1}</span>
                            <p className="serif-title text-2xl text-aubergine">Variant {index + 1}</p>
                          </div>
                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setVariants((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                              className="inline-flex min-h-10 items-center gap-2 border border-red-300 bg-ivory px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                            >
                              <Trash2 size={16} /> Remove Variant
                            </button>
                          )}
                        </div>

                        <div className="grid gap-5">
                          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(128px,160px)]">
                            <div className="grid min-w-0 gap-1">
                              <Input
                                label="Color name"
                                value={variant.colorName}
                                onChange={(event) => updateVariant(index, { colorName: event.target.value })}
                                aria-invalid={Boolean(fieldErrors[`variants.${index}.colorName`])}
                              />
                              <FieldError message={fieldErrors[`variants.${index}.colorName`]} />
                            </div>
                            <label className="grid min-w-0 gap-2 text-sm text-onyx/80">
                              <span className="fine-label text-aubergine">Color Picker</span>
                              <input
                                type="color"
                                value={variant.colorHex}
                                onChange={(event) => updateVariant(index, { colorHex: event.target.value })}
                                className="h-12 w-full border border-smoke bg-ivory p-1 outline-none transition focus:border-aubergine focus:ring-2 focus:ring-deepPurple/20"
                                aria-label={`Variant ${index + 1} color picker`}
                              />
                            </label>
                          </div>

                          <div className="grid max-w-md gap-1">
                            <Input
                              label="Hex code"
                              value={variant.colorHex}
                              onChange={(event) => updateVariant(index, { colorHex: event.target.value })}
                              aria-invalid={Boolean(fieldErrors[`variants.${index}.colorHex`])}
                            />
                            <FieldError message={fieldErrors[`variants.${index}.colorHex`]} />
                          </div>

                          <div className="grid gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="fine-label text-aubergine">Images</p>
                                <p className="mt-1 text-sm text-onyx/55">{imageUrls.length} image{imageUrls.length === 1 ? "" : "s"} uploaded</p>
                              </div>
                              <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-aubergine/50 bg-ivory px-3 text-sm font-semibold text-aubergine transition hover:border-aubergine/40 hover:bg-softPurple/10">
                                <ImagePlus size={16} />
                                {isUploading ? "Uploading..." : "Upload Image"}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  className="sr-only"
                                  disabled={isUploading}
                                  onChange={(event) => uploadVariantImage(index, event)}
                                />
                              </label>
                            </div>
                            {imageUrls.length === 0 && <FieldError message={fieldErrors[`variants.${index}.images`]} />}
                            {imageUrls.length > 0 && (
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
                                {imageUrls.map((url, imageIndex) => (
                                  <div key={`${url}-${imageIndex}`} className="relative overflow-hidden border border-aubergine/35 bg-ivory shadow-sm">
                                    <VariantImagePreview url={url} alt={`Variant ${index + 1} image ${imageIndex + 1}`} />
                                    <button
                                      type="button"
                                      onClick={() => updateVariant(index, { images: removeImageUrl(variant.images, imageIndex) })}
                                      className="absolute right-2 top-2 grid h-9 w-9 place-items-center border border-red-300 bg-ivory/95 text-red-700 shadow-sm transition hover:bg-red-50"
                                      aria-label={`Remove variant ${index + 1} image ${imageIndex + 1}`}
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                            <div className="grid min-w-0 gap-1">
                              <Input
                                label="Available sizes"
                                value={variant.sizesText}
                                onChange={(event) => updateVariant(index, { sizesText: event.target.value })}
                                aria-invalid={Boolean(fieldErrors[`variants.${index}.sizes`])}
                              />
                              <FieldError message={fieldErrors[`variants.${index}.sizes`]} />
                            </div>
                            <div className="grid min-w-0 gap-1">
                              <Input
                                label="Stock"
                                type="number"
                                min="0"
                                step="1"
                                value={variant.stock}
                                onChange={(event) => updateVariant(index, { stock: event.target.value })}
                                aria-invalid={Boolean(fieldErrors[`variants.${index}.stock`])}
                              />
                              <FieldError message={fieldErrors[`variants.${index}.stock`]} />
                            </div>
                            <div className="grid min-w-0 gap-1 md:col-span-2 2xl:col-span-1">
                              <Input
                                label="Price override"
                                type="number"
                                min="0"
                                step="0.01"
                                value={variant.priceOverride ?? ""}
                                onChange={(event) => updateVariant(index, { priceOverride: event.target.value || undefined })}
                                aria-invalid={Boolean(fieldErrors[`variants.${index}.priceOverride`])}
                              />
                              <FieldError message={fieldErrors[`variants.${index}.priceOverride`]} />
                            </div>
                          </div>

                          <div className="grid max-w-md gap-1">
                            <Input label="SKU" value={variant.sku || ""} onChange={(event) => updateVariant(index, { sku: event.target.value })} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </FormSection>

            <FormSection title="Product Flags">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex min-h-12 items-center gap-3 border border-aubergine/30 bg-linen/20 px-4 text-sm font-semibold text-aubergine">
                  <input type="checkbox" name="featured" defaultChecked={defaults.featured} className="h-4 w-4 accent-aubergine" /> Featured product
                </label>
                <label className="flex min-h-12 items-center gap-3 border border-aubergine/30 bg-linen/20 px-4 text-sm font-semibold text-aubergine">
                  <input type="checkbox" name="active" defaultChecked={defaults.active} className="h-4 w-4 accent-aubergine" /> Active
                </label>
              </div>
            </FormSection>

            <div className="sticky bottom-0 z-10 -mx-5 flex flex-wrap gap-3 border-t border-aubergine/30 bg-ivory/95 px-5 pt-5 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-7 lg:px-7">
              <Button type="submit" disabled={saving} className="min-w-36">{saving ? "Saving..." : editing ? "Save Product" : "Add Product"}</Button>
              {editing && <Button type="button" variant="secondary" onClick={() => resetForm()} disabled={saving}>Cancel</Button>}
            </div>
          </div>
        </form>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="fine-label text-plum">Catalog</p>
              <h2 className="serif-title text-3xl text-aubergine">Product List</h2>
            </div>
            <AdminStatusBadge tone="muted">{products.length} products</AdminStatusBadge>
          </div>

          <div className="grid content-start gap-4">
          {loading && Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40 w-full border border-aubergine/20" />)}
          {!loading && products.length === 0 && <AdminEmptyState title="No products yet" message="Add a product and at least one variant to start building the storefront catalog." />}
          {!loading && products.map((product) => {
            const variantsForProduct = getProductVariants(product);
            return (
              <motion.article layout key={product.id} className="grid gap-4 border border-aubergine/30 bg-ivory p-4 shadow-sm sm:grid-cols-[112px_minmax(0,1fr)]">
                <div className="aspect-square w-28 overflow-hidden border border-aubergine/25 bg-linen sm:w-full">
                  <img src={getProductImage(product, variantsForProduct[0])} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="grid min-w-0 gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="serif-title text-2xl leading-tight text-aubergine">{product.name}</h3>
                      <p className="mt-1 text-sm text-onyx/55">{variantsForProduct.length} variant{variantsForProduct.length === 1 ? "" : "s"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <AdminStatusBadge tone={product.active ? "purple" : "muted"}>{product.active ? "Active" : "Inactive"}</AdminStatusBadge>
                      {product.featured && <AdminStatusBadge tone="neutral">Featured</AdminStatusBadge>}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="border border-aubergine/20 bg-linen/20 px-3 py-2">
                      <p className="fine-label text-plum">Price</p>
                      <p className="mt-1 font-semibold text-aubergine">{formatCurrency(product.discountPrice || product.price)}</p>
                    </div>
                    <div className="border border-aubergine/20 bg-linen/20 px-3 py-2">
                      <p className="fine-label text-plum">Stock</p>
                      <p className="mt-1 font-semibold text-aubergine">{getProductStock(product)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {variantsForProduct.map((variant) => (
                      <span
                        key={variant.id}
                        title={variant.colorName}
                        className="h-5 w-5 border border-aubergine/60 shadow-sm"
                        style={{ backgroundColor: variant.colorHex }}
                      />
                    ))}
                    {!variantsForProduct.length && <span className="text-sm text-onyx/50">No active variants</span>}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <button
                      disabled={saving || deletingId === product.id}
                      onClick={() => edit(product)}
                      className="min-h-10 border border-aubergine/50 px-4 text-sm font-semibold text-aubergine transition hover:border-aubergine/40 hover:bg-softPurple/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Edit
                    </button>
                    <button
                      disabled={deletingId === product.id}
                      onClick={() => remove(product.id)}
                      className="min-h-10 border border-red-300 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === product.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

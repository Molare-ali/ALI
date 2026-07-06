import type { ProductVariant } from "./types";

export type ValidatedVariantPayload = Omit<ProductVariant, "id"> & { id?: string };

export type ValidatedProductPayload = {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  variants: ValidatedVariantPayload[];
  featured: boolean;
  active: boolean;
};

export type ProductValidationResult =
  | { ok: true; product: ValidatedProductPayload; fieldErrors: Record<string, string> }
  | { ok: false; error: string; fieldErrors: Record<string, string> };

const hexColorPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hasValue(value: unknown) {
  return !(value === null || value === undefined || (typeof value === "string" && value.trim() === ""));
}

function list(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => text(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function numberValue(value: unknown) {
  if (!hasValue(value)) return undefined;
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
}

function booleanValue(value: unknown, fallback = false) {
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
}

function firstError(fieldErrors: Record<string, string>) {
  return Object.values(fieldErrors)[0] || "Product data is invalid.";
}

export function normalizeProductPayload(payload: unknown): ProductValidationResult {
  const fieldErrors: Record<string, string> = {};
  const body = isRecord(payload) ? payload : {};

  function addError(field: string, message: string) {
    fieldErrors[field] ||= message;
  }

  const name = text(body.name);
  const description = text(body.description);
  const categoryId = text(body.categoryId);
  const price = numberValue(body.price);
  const discountPrice = numberValue(body.discountPrice);
  const variantsInput = Array.isArray(body.variants) ? body.variants : [];
  const variants: ValidatedVariantPayload[] = [];

  if (!name) addError("name", "Product name is required.");
  if (!description) addError("description", "Product description is required.");
  if (!categoryId) addError("categoryId", "Product category is required.");
  if (price === undefined || price < 0) addError("price", "Price must be a valid number greater than or equal to 0.");

  if (hasValue(body.discountPrice)) {
    if (discountPrice === undefined || discountPrice < 0) {
      addError("discountPrice", "Discount price must be a valid number greater than or equal to 0.");
    } else if (price !== undefined && discountPrice > price) {
      addError("discountPrice", "Discount price must be less than or equal to price.");
    }
  }

  if (!variantsInput.length) {
    addError("variants", "Product must have at least one variant.");
  }

  variantsInput.forEach((item, index) => {
    const variant = isRecord(item) ? item : {};
    const label = `Variant ${index + 1}`;
    const fieldPrefix = `variants.${index}`;
    const id = text(variant.id);
    const colorName = text(variant.colorName);
    const colorHex = text(variant.colorHex);
    const images = list(variant.images);
    const sizes = list(variant.sizes);
    const stock = numberValue(variant.stock);
    const sku = text(variant.sku);
    const priceOverride = numberValue(variant.priceOverride);

    if (!colorName) addError(`${fieldPrefix}.colorName`, `${label} color name is required.`);
    if (!colorHex || !hexColorPattern.test(colorHex)) addError(`${fieldPrefix}.colorHex`, `${label} color hex must be a valid hex color.`);
    if (!images.length) addError(`${fieldPrefix}.images`, `${label} must have at least one image URL.`);
    if (!sizes.length) addError(`${fieldPrefix}.sizes`, `${label} must have at least one size.`);
    if (stock === undefined || !Number.isInteger(stock) || stock < 0) {
      addError(`${fieldPrefix}.stock`, `${label} stock must be an integer greater than or equal to 0.`);
    }
    if (hasValue(variant.priceOverride) && (priceOverride === undefined || priceOverride < 0)) {
      addError(`${fieldPrefix}.priceOverride`, `${label} price override must be a valid number greater than or equal to 0.`);
    }

    variants.push({
      ...(id ? { id } : {}),
      colorName,
      colorHex,
      images,
      sizes,
      stock: stock ?? 0,
      ...(sku ? { sku } : {}),
      ...(priceOverride !== undefined ? { priceOverride } : {}),
      active: booleanValue(variant.active, true)
    });
  });

  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: firstError(fieldErrors), fieldErrors };
  }

  return {
    ok: true,
    fieldErrors,
    product: {
      name,
      description,
      price: price ?? 0,
      ...(discountPrice !== undefined ? { discountPrice } : {}),
      categoryId,
      images: list(body.images),
      sizes: list(body.sizes),
      colors: list(body.colors),
      stockQuantity: numberValue(body.stockQuantity) ?? 0,
      variants,
      featured: booleanValue(body.featured),
      active: booleanValue(body.active)
    }
  };
}

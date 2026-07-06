export const productImageBucket = "product-images";
export const maxProductImageSize = 5 * 1024 * 1024;

const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
} as const;

type AllowedImageType = keyof typeof allowedImageTypes;

export type ProductImageValidationResult =
  | { ok: true; file: File }
  | { ok: false; error: string };

export function validateProductImageFile(file: FormDataEntryValue | null): ProductImageValidationResult {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Image file is required." };
  }

  if (!Object.hasOwn(allowedImageTypes, file.type)) {
    return { ok: false, error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
  }

  if (file.size > maxProductImageSize) {
    return { ok: false, error: "Image file must be 5MB or smaller." };
  }

  return { ok: true, file };
}

export function buildProductImagePath(contentType: string, timestamp = Date.now(), random = crypto.randomUUID()) {
  const extension = allowedImageTypes[contentType as AllowedImageType] || "bin";
  return `products/${timestamp}-${random}.${extension}`;
}

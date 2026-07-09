export const siteAssetBucket = "site-assets";
export const maxSiteAssetImageSize = 5 * 1024 * 1024;

const allowedSiteAssetImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
} as const;

type AllowedSiteAssetImageType = keyof typeof allowedSiteAssetImageTypes;

export type SiteAssetImageValidationResult =
  | { ok: true; file: File }
  | { ok: false; error: string };

export function validateSiteAssetImageFile(file: FormDataEntryValue | null): SiteAssetImageValidationResult {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Image file is required." };
  }

  if (!Object.hasOwn(allowedSiteAssetImageTypes, file.type)) {
    return { ok: false, error: "Only JPEG, PNG, or WebP images are allowed." };
  }

  if (file.size > maxSiteAssetImageSize) {
    return { ok: false, error: "Image file must be 5MB or smaller." };
  }

  return { ok: true, file };
}

export function buildSiteAssetPath(contentType: string, timestamp = Date.now(), random = crypto.randomUUID()) {
  const extension = allowedSiteAssetImageTypes[contentType as AllowedSiteAssetImageType] || "bin";
  return `homepage/${timestamp}-${random}.${extension}`;
}

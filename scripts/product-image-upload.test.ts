import assert from "node:assert/strict";
import { buildProductImagePath, validateProductImageFile } from "../src/lib/product-image-upload";

const onePixelPng = new Uint8Array([137, 80, 78, 71]);

{
  const result = validateProductImageFile(null);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "Image file is required.");
}

{
  const file = new File([onePixelPng], "image.txt", { type: "text/plain" });
  const result = validateProductImageFile(file);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "Only JPEG, PNG, WebP, or GIF images are allowed.");
}

{
  const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", { type: "image/png" });
  const result = validateProductImageFile(file);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "Image file must be 5MB or smaller.");
}

{
  const file = new File([onePixelPng], "catalog shot.WEBP", { type: "image/webp" });
  const result = validateProductImageFile(file);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.file, file);
}

assert.equal(buildProductImagePath("image/jpeg", 1700000000000, "abc123"), "products/1700000000000-abc123.jpg");
assert.equal(buildProductImagePath("image/png", 1700000000000, "abc123"), "products/1700000000000-abc123.png");
assert.equal(buildProductImagePath("image/webp", 1700000000000, "abc123"), "products/1700000000000-abc123.webp");
assert.equal(buildProductImagePath("image/gif", 1700000000000, "abc123"), "products/1700000000000-abc123.gif");

console.log("product image upload tests passed");

import assert from "node:assert/strict";
import { normalizeProductPayload } from "../src/lib/product-validation";

function validPayload() {
  return {
    name: "  Linen Dress  ",
    description: "  Summer dress  ",
    categoryId: "  cat-1  ",
    price: "120",
    discountPrice: "90",
    featured: true,
    active: true,
    variants: [
      {
        id: "",
        colorName: "  Ivory  ",
        colorHex: " #F5F1EA ",
        images: [" https://example.com/dress-front.jpg ", ""],
        sizes: [" S ", "", "M"],
        stock: "4",
        sku: "  SKU-1  ",
        priceOverride: "95",
        active: true
      }
    ]
  };
}

function assertInvalid(payload: unknown, expectedError: string) {
  const result = normalizeProductPayload(payload);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, expectedError);
}

{
  const result = normalizeProductPayload(validPayload());
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.product.name, "Linen Dress");
    assert.equal(result.product.description, "Summer dress");
    assert.equal(result.product.categoryId, "cat-1");
    assert.equal(result.product.price, 120);
    assert.equal(result.product.discountPrice, 90);
    assert.deepEqual(result.product.variants[0], {
      colorName: "Ivory",
      colorHex: "#F5F1EA",
      images: ["https://example.com/dress-front.jpg"],
      sizes: ["S", "M"],
      stock: 4,
      sku: "SKU-1",
      priceOverride: 95,
      active: true
    });
  }
}

assertInvalid({ ...validPayload(), price: "abc" }, "Price must be a valid number greater than or equal to 0.");
assertInvalid({ ...validPayload(), discountPrice: "140" }, "Discount price must be less than or equal to price.");
assertInvalid({ ...validPayload(), variants: [] }, "Product must have at least one variant.");
assertInvalid(
  { ...validPayload(), variants: [{ ...validPayload().variants[0], colorHex: "blue" }] },
  "Variant 1 color hex must be a valid hex color."
);
assertInvalid(
  { ...validPayload(), variants: [{ ...validPayload().variants[0], images: [""] }] },
  "Variant 1 must have at least one image URL."
);
assertInvalid(
  { ...validPayload(), variants: [{ ...validPayload().variants[0], sizes: [""] }] },
  "Variant 1 must have at least one size."
);
assertInvalid(
  { ...validPayload(), variants: [{ ...validPayload().variants[0], stock: "-1" }] },
  "Variant 1 stock must be an integer greater than or equal to 0."
);

console.log("product validation tests passed");

import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "../src/lib/user-auth";
import type { CartItem, Category, Customer, Order, Product, ProductVariant, StoreData, StoreSettings } from "../src/lib/types";

type JsonUser = Customer & {
  password?: string;
  passwordHash?: string;
};

type JsonStoreData = Omit<StoreData, "users"> & {
  users: JsonUser[];
};

type Summary = {
  categories: number;
  products: number;
  variants: number;
  users: number;
  orders: number;
  orderItems: number;
  settings: number;
};

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local before running the migration.");
}

if (!supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local before running the migration.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

function assertObject(value: unknown, pathName: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${pathName} must be an object.`);
  }
}

function assertArray(value: unknown, pathName: string): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${pathName} must be an array.`);
  }
}

function assertString(value: unknown, pathName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${pathName} must be a non-empty string.`);
  }
}

function assertNumber(value: unknown, pathName: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${pathName} must be a finite number.`);
  }
}

function assertOptionalNumber(value: unknown, pathName: string) {
  if (value !== undefined && value !== null) {
    assertNumber(value, pathName);
  }
}

function assertOptionalString(value: unknown, pathName: string) {
  if (value !== undefined && value !== null && typeof value !== "string") {
    throw new Error(`${pathName} must be a string when provided.`);
  }
}

function assertStringArray(value: unknown, pathName: string) {
  assertArray(value, pathName);
  value.forEach((item, index) => assertString(item, `${pathName}[${index}]`));
}

function asOptionalNumber(value: number | undefined) {
  return value === undefined ? null : value;
}

function stableVariantId(productId: string, index: number) {
  return `${productId}-variant-${index + 1}`;
}

function validateCategory(category: Category, index: number) {
  const pathName = `categories[${index}]`;
  assertObject(category, pathName);
  assertString(category.id, `${pathName}.id`);
  assertString(category.name, `${pathName}.name`);
  assertString(category.slug, `${pathName}.slug`);
  assertString(category.description, `${pathName}.description`);
}

function validateVariant(variant: ProductVariant, productIndex: number, variantIndex: number) {
  const pathName = `products[${productIndex}].variants[${variantIndex}]`;
  assertObject(variant, pathName);
  assertString(variant.colorName, `${pathName}.colorName`);
  assertString(variant.colorHex, `${pathName}.colorHex`);
  assertStringArray(variant.images, `${pathName}.images`);
  assertStringArray(variant.sizes, `${pathName}.sizes`);
  assertNumber(variant.stock, `${pathName}.stock`);
  assertOptionalString(variant.sku, `${pathName}.sku`);
  assertOptionalNumber(variant.priceOverride, `${pathName}.priceOverride`);
}

function validateProduct(product: Product, index: number) {
  const pathName = `products[${index}]`;
  assertObject(product, pathName);
  assertString(product.id, `${pathName}.id`);
  assertString(product.name, `${pathName}.name`);
  assertString(product.slug, `${pathName}.slug`);
  assertString(product.description, `${pathName}.description`);
  assertNumber(product.price, `${pathName}.price`);
  assertOptionalNumber(product.discountPrice, `${pathName}.discountPrice`);
  if (product.discountPrice !== undefined && product.discountPrice > product.price) {
    throw new Error(`${pathName}.discountPrice must be less than or equal to ${pathName}.price.`);
  }
  assertString(product.categoryId, `${pathName}.categoryId`);
  if (product.images !== undefined) assertStringArray(product.images, `${pathName}.images`);
  if (product.sizes !== undefined) assertStringArray(product.sizes, `${pathName}.sizes`);
  if (product.colors !== undefined) assertStringArray(product.colors, `${pathName}.colors`);
  assertOptionalNumber(product.stockQuantity, `${pathName}.stockQuantity`);
  assertArray(product.variants, `${pathName}.variants`);
  product.variants.forEach((variant, variantIndex) => validateVariant(variant, index, variantIndex));
}

function validateUser(user: JsonUser, index: number) {
  const pathName = `users[${index}]`;
  assertObject(user, pathName);
  assertString(user.id, `${pathName}.id`);
  assertString(user.fullName, `${pathName}.fullName`);
  assertString(user.email, `${pathName}.email`);
  assertOptionalString(user.phone, `${pathName}.phone`);
  if (user.role !== "customer" && user.role !== "admin") {
    throw new Error(`${pathName}.role must be "customer" or "admin".`);
  }
  if (!user.passwordHash && !user.password) {
    throw new Error(`${pathName}.passwordHash is required.`);
  }
  assertOptionalString(user.passwordHash, `${pathName}.passwordHash`);
  assertOptionalString(user.password, `${pathName}.password`);
}

function validateOrderItem(item: CartItem, orderIndex: number, itemIndex: number) {
  const pathName = `orders[${orderIndex}].items[${itemIndex}]`;
  assertObject(item, pathName);
  assertString(item.productId, `${pathName}.productId`);
  assertOptionalString(item.variantId, `${pathName}.variantId`);
  assertString(item.name, `${pathName}.name`);
  assertString(item.slug, `${pathName}.slug`);
  assertString(item.image, `${pathName}.image`);
  assertString(item.size, `${pathName}.size`);
  assertString(item.color, `${pathName}.color`);
  assertOptionalString(item.colorHex, `${pathName}.colorHex`);
  assertNumber(item.quantity, `${pathName}.quantity`);
  assertNumber(item.price, `${pathName}.price`);
  assertOptionalString(item.sku, `${pathName}.sku`);
}

function validateOrder(order: Order, index: number) {
  const pathName = `orders[${index}]`;
  assertObject(order, pathName);
  assertString(order.id, `${pathName}.id`);
  assertString(order.orderNumber, `${pathName}.orderNumber`);
  assertOptionalString(order.customerId, `${pathName}.customerId`);
  assertString(order.customerName, `${pathName}.customerName`);
  assertString(order.customerPhone, `${pathName}.customerPhone`);
  assertString(order.city, `${pathName}.city`);
  assertString(order.address, `${pathName}.address`);
  assertOptionalString(order.notes, `${pathName}.notes`);
  assertArray(order.items, `${pathName}.items`);
  order.items.forEach((item, itemIndex) => validateOrderItem(item, index, itemIndex));
  assertNumber(order.total, `${pathName}.total`);
  if (!["Pending", "Confirmed", "Preparing", "Delivered", "Cancelled"].includes(order.status)) {
    throw new Error(`${pathName}.status is not a valid order status.`);
  }
  assertString(order.createdAt, `${pathName}.createdAt`);
}

function validateSettings(settings: StoreSettings) {
  assertObject(settings, "settings");
  assertString(settings.whatsappNumber, "settings.whatsappNumber");
  assertString(settings.contactPhone, "settings.contactPhone");
  assertString(settings.contactEmail, "settings.contactEmail");
  assertString(settings.storeAddress, "settings.storeAddress");
  assertOptionalString(settings.instagramLink, "settings.instagramLink");
  assertOptionalString(settings.facebookLink, "settings.facebookLink");
  assertOptionalString(settings.tiktokLink, "settings.tiktokLink");
  assertOptionalString(settings.snapchatLink, "settings.snapchatLink");
}

function validateStoreData(data: JsonStoreData) {
  assertObject(data, "data");
  assertArray(data.categories, "categories");
  assertArray(data.products, "products");
  assertArray(data.users, "users");
  assertArray(data.orders, "orders");
  validateSettings(data.settings);

  data.categories.forEach(validateCategory);
  data.products.forEach(validateProduct);
  data.users.forEach(validateUser);
  data.orders.forEach(validateOrder);

  [
    { pathName: "categories", ids: data.categories.map((category) => category.id) },
    { pathName: "products", ids: data.products.map((product) => product.id) },
    { pathName: "users", ids: data.users.map((user) => user.id) },
    { pathName: "orders", ids: data.orders.map((order) => order.id) },
    {
      pathName: "product variants",
      ids: data.products.flatMap((product) => (product.variants || []).map((variant, index) => variant.id || stableVariantId(product.id, index)))
    }
  ].forEach((group) => {
    const seenIds = new Set<string>();
    group.ids.forEach((itemId) => {
      if (seenIds.has(itemId)) {
        throw new Error(`${group.pathName} contains duplicate id "${itemId}".`);
      }
      seenIds.add(itemId);
    });
  });

  data.products.forEach((product) => {
    const seenVariantIds = new Set<string>();
    (product.variants || []).forEach((variant, index) => {
      const variantId = variant.id || stableVariantId(product.id, index);
      if (seenVariantIds.has(variantId)) {
        throw new Error(`Product "${product.id}" contains duplicate variant id "${variantId}".`);
      }
      seenVariantIds.add(variantId);
    });
  });

  data.orders.forEach((order) => {
    order.items.forEach((item, index) => {
      if (item.quantity <= 0) {
        throw new Error(`orders.${order.id}.items[${index}].quantity must be greater than 0.`);
      }
      if (item.price < 0) {
        throw new Error(`orders.${order.id}.items[${index}].price must be greater than or equal to 0.`);
      }
    });
  });

  data.products.forEach((product) => {
    if (product.price < 0) {
      throw new Error(`Product "${product.id}" price must be greater than or equal to 0.`);
    }
    if ((product.stockQuantity || 0) < 0) {
      throw new Error(`Product "${product.id}" stockQuantity must be greater than or equal to 0.`);
    }
    (product.variants || []).forEach((variant) => {
      if (variant.stock < 0) {
        throw new Error(`Variant "${variant.id}" stock must be greater than or equal to 0.`);
      }
      if (variant.priceOverride !== undefined && variant.priceOverride < 0) {
        throw new Error(`Variant "${variant.id}" priceOverride must be greater than or equal to 0.`);
      }
    });
  });

  data.orders.forEach((order) => {
    if (order.total < 0) {
      throw new Error(`Order "${order.id}" total must be greater than or equal to 0.`);
    }
  });

  const categoryIds = new Set(data.categories.map((category) => category.id));
  data.products.forEach((product, index) => {
    if (!categoryIds.has(product.categoryId)) {
      throw new Error(`products[${index}].categoryId references missing category "${product.categoryId}".`);
    }
  });

  const emails = new Set<string>();
  data.users.forEach((user, index) => {
    const email = user.email.toLowerCase();
    if (emails.has(email)) {
      throw new Error(`users[${index}].email duplicates another user email: ${email}.`);
    }
    emails.add(email);
  });
}

async function upsertOrThrow(table: string, rows: Record<string, unknown>[], onConflict = "id") {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`Failed to upsert ${table}: ${error.message}`);
}

async function deleteOrderItems(orderIds: string[]) {
  if (!orderIds.length) return;
  const { error } = await supabase.from("order_items").delete().in("order_id", orderIds);
  if (error) throw new Error(`Failed to delete existing order_items: ${error.message}`);
}

async function insertOrderItems(rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const { error } = await supabase.from("order_items").insert(rows);
  if (error) throw new Error(`Failed to insert order_items: ${error.message}`);
}

async function main() {
  const dataPath = path.join(process.cwd(), "data", "molare-store.json");
  const raw = await fs.readFile(dataPath, "utf8");
  const data = JSON.parse(raw) as JsonStoreData;
  validateStoreData(data);

  const summary: Summary = {
    categories: data.categories.length,
    products: data.products.length,
    variants: data.products.reduce((sum, product) => sum + (product.variants?.length || 0), 0),
    users: data.users.length,
    orders: data.orders.length,
    orderItems: data.orders.reduce((sum, order) => sum + order.items.length, 0),
    settings: 1
  };

  await upsertOrThrow(
    "categories",
    data.categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description
    }))
  );

  await upsertOrThrow(
    "products",
    data.products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      discount_price: asOptionalNumber(product.discountPrice),
      category_id: product.categoryId,
      featured: product.featured,
      active: product.active,
      images: product.images || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      stock_quantity: product.stockQuantity || 0
    }))
  );

  await upsertOrThrow(
    "product_variants",
    data.products.flatMap((product) =>
      (product.variants || []).map((variant, index) => ({
        id: variant.id || stableVariantId(product.id, index),
        product_id: product.id,
        color_name: variant.colorName,
        color_hex: variant.colorHex,
        images: variant.images,
        sizes: variant.sizes,
        stock: variant.stock,
        sku: variant.sku || null,
        price_override: asOptionalNumber(variant.priceOverride),
        active: variant.active !== false,
        position: index
      }))
    )
  );

  const userRows = await Promise.all(
    data.users.map(async (user) => ({
      id: user.id,
      full_name: user.fullName,
      email: user.email.toLowerCase(),
      phone: user.phone || null,
      role: user.role,
      password_hash: user.passwordHash || (await hashPassword(user.password || ""))
    }))
  );

  await upsertOrThrow(
    "users",
    userRows
  );

  await upsertOrThrow(
    "orders",
    data.orders.map((order) => ({
      id: order.id,
      order_number: order.orderNumber,
      customer_id: order.customerId || null,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      city: order.city,
      address: order.address,
      notes: order.notes || "",
      total: order.total,
      status: order.status,
      created_at: order.createdAt
    }))
  );

  const orderIds = data.orders.map((order) => order.id);
  await deleteOrderItems(orderIds);
  await insertOrderItems(
    data.orders.flatMap((order) =>
      order.items.map((item, index) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId || null,
        product_name: item.name,
        product_slug: item.slug,
        image_url: item.image,
        size: item.size,
        color_name: item.color,
        color_hex: item.colorHex || null,
        quantity: item.quantity,
        unit_price: item.price,
        sku: item.sku || null,
        position: index
      }))
    )
  );

  await upsertOrThrow("store_settings", [
    {
      id: "default",
      whatsapp_number: data.settings.whatsappNumber,
      contact_phone: data.settings.contactPhone,
      contact_email: data.settings.contactEmail,
      store_address: data.settings.storeAddress,
      instagram_link: data.settings.instagramLink || "",
      facebook_link: data.settings.facebookLink || "",
      tiktok_link: data.settings.tiktokLink || "",
      snapchat_link: data.settings.snapchatLink || ""
    }
  ]);

  console.log("JSON to Supabase migration complete:");
  console.log(`- categories upserted: ${summary.categories}`);
  console.log(`- products upserted: ${summary.products}`);
  console.log(`- variants upserted: ${summary.variants}`);
  console.log(`- users upserted: ${summary.users}`);
  console.log(`- orders upserted: ${summary.orders}`);
  console.log(`- order items inserted: ${summary.orderItems}`);
  console.log(`- settings updated: ${summary.settings}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Migration failed: ${message}`);
  process.exit(1);
});

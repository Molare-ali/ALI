import { normalizeVariants } from "./product-utils";
import { supabase } from "./supabase/server";
import type { UserAuthRecord } from "./user-auth";
import type { CartItem, Category, Order, OrderStatus, Product, ProductVariant, StoreData, StoreSettings } from "./types";

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  discount_price: number | string | null;
  category_id: string;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  stock_quantity: number | null;
  featured: boolean;
  active: boolean;
};

type DbProductVariant = {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  images: string[] | null;
  sizes: string[] | null;
  stock: number | null;
  sku: string | null;
  price_override: number | string | null;
  active: boolean | null;
  position: number | null;
};

type DbUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "customer" | "admin";
};

type DbUserAuth = DbUser & {
  password_hash: string | null;
};

type DbOrder = {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  city: string;
  address: string;
  notes: string | null;
  total: number | string;
  status: OrderStatus;
  created_at: string;
};

type DbOrderItem = {
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_slug: string;
  image_url: string;
  size: string;
  color_name: string;
  color_hex: string | null;
  quantity: number;
  unit_price: number | string;
  sku: string | null;
  position: number | null;
};

type DbStoreSettings = {
  whatsapp_number: string;
  contact_phone: string;
  contact_email: string;
  store_address: string;
  instagram_link: string;
  facebook_link: string;
  tiktok_link: string;
  snapchat_link: string;
};

const defaultSettings: StoreSettings = {
  whatsappNumber: "",
  contactPhone: "",
  contactEmail: "",
  storeAddress: "",
  instagramLink: "",
  facebookLink: "",
  tiktokLink: "",
  snapchatLink: ""
};

function fail(operation: string, error: { message: string; details?: string | null } | null) {
  if (!error) return;
  const details = error.details ? ` ${error.details}` : "";
  throw new Error(`Supabase ${operation} failed: ${error.message}.${details}`);
}

function asNumber(value: number | string | null | undefined) {
  return Number(value || 0);
}

function optionalNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return undefined;
  return Number(value);
}

function byPositionThenId<T extends { position: number | null; id?: string }>(a: T, b: T) {
  return (a.position ?? 0) - (b.position ?? 0) || String(a.id || "").localeCompare(String(b.id || ""));
}

function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description
  };
}

function mapVariant(row: DbProductVariant): ProductVariant {
  return {
    id: row.id,
    colorName: row.color_name,
    colorHex: row.color_hex,
    images: row.images || [],
    sizes: row.sizes || [],
    stock: row.stock || 0,
    sku: row.sku || undefined,
    priceOverride: optionalNumber(row.price_override),
    active: row.active !== false
  };
}

function mapProduct(row: DbProduct, variants: ProductVariant[]): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: asNumber(row.price),
    discountPrice: optionalNumber(row.discount_price),
    categoryId: row.category_id,
    images: row.images || [],
    sizes: row.sizes || [],
    colors: row.colors || [],
    stockQuantity: row.stock_quantity || 0,
    variants,
    featured: row.featured,
    active: row.active
  };
}

function mapOrderItem(row: DbOrderItem): CartItem {
  return {
    productId: row.product_id || "",
    variantId: row.variant_id || undefined,
    name: row.product_name,
    slug: row.product_slug,
    image: row.image_url,
    size: row.size,
    color: row.color_name,
    colorHex: row.color_hex || undefined,
    quantity: row.quantity,
    price: asNumber(row.unit_price),
    sku: row.sku || undefined
  };
}

function mapOrder(row: DbOrder, items: CartItem[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id || "",
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    city: row.city,
    address: row.address,
    notes: row.notes || "",
    items,
    total: asNumber(row.total),
    status: row.status,
    createdAt: row.created_at
  };
}

function mapSettings(row: DbStoreSettings | null): StoreSettings {
  if (!row) return defaultSettings;
  return {
    whatsappNumber: row.whatsapp_number,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    storeAddress: row.store_address,
    instagramLink: row.instagram_link,
    facebookLink: row.facebook_link,
    tiktokLink: row.tiktok_link,
    snapchatLink: row.snapchat_link
  };
}

function productRow(product: Product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    discount_price: product.discountPrice ?? null,
    category_id: product.categoryId,
    images: product.images || [],
    sizes: product.sizes || [],
    colors: product.colors || [],
    stock_quantity: product.stockQuantity || 0,
    featured: product.featured,
    active: product.active
  };
}

function variantRow(productId: string, variant: ProductVariant, position: number) {
  return {
    id: variant.id,
    product_id: productId,
    color_name: variant.colorName,
    color_hex: variant.colorHex,
    images: variant.images || [],
    sizes: variant.sizes || [],
    stock: variant.stock || 0,
    sku: variant.sku || null,
    price_override: variant.priceOverride ?? null,
    active: variant.active !== false,
    position
  };
}

function orderRow(order: Order) {
  return {
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
  };
}

function orderItemRow(orderId: string, item: CartItem, position: number, productIds: Set<string>, variantIds: Set<string>) {
  return {
    order_id: orderId,
    product_id: productIds.has(item.productId) ? item.productId : null,
    variant_id: item.variantId && variantIds.has(item.variantId) ? item.variantId : null,
    product_name: item.name,
    product_slug: item.slug,
    image_url: item.image,
    size: item.size,
    color_name: item.color,
    color_hex: item.colorHex || null,
    quantity: item.quantity,
    unit_price: item.price,
    sku: item.sku || null,
    position
  };
}

function settingsRow(settings: StoreSettings) {
  return {
    id: "default",
    whatsapp_number: settings.whatsappNumber,
    contact_phone: settings.contactPhone,
    contact_email: settings.contactEmail,
    store_address: settings.storeAddress,
    instagram_link: settings.instagramLink,
    facebook_link: settings.facebookLink,
    tiktok_link: settings.tiktokLink,
    snapchat_link: settings.snapchatLink
  };
}

function ensureVariantIds(product: Product) {
  product.variants = normalizeVariants(product).map((variant) => ({
    ...variant,
    id: variant.id?.trim() || id("var")
  }));
  return product.variants;
}

async function tableIds(table: "categories" | "products" | "orders" | "users") {
  const { data, error } = await supabase.from(table).select("id");
  fail(`select ${table} ids`, error);
  return new Set((data as Array<{ id: string }> | null || []).map((row) => row.id));
}

async function deleteMissingRows(table: "categories" | "products" | "orders" | "users", keepIds: string[]) {
  const existingIds = await tableIds(table);
  const keep = new Set(keepIds);
  const missing = [...existingIds].filter((existingId) => !keep.has(existingId));
  if (!missing.length) return;

  const { error } = await supabase.from(table).delete().in("id", missing);
  fail(`delete missing ${table}`, error);
}

async function ensureUniqueOrderNumbers(orders: Order[]) {
  if (!orders.length) return;

  const { data, error } = await supabase.from("orders").select("id, order_number");
  fail("select existing order numbers", error);

  const existing = (data as Array<{ id: string; order_number: string }> | null) || [];
  const existingOwnerByNumber = new Map(existing.map((order) => [order.order_number, order.id]));
  const usedNumbers = new Set<string>();
  let nextSequence = 1;
  const currentYear = new Date().getFullYear();

  for (const order of [...existing, ...orders.map((item) => ({ id: item.id, order_number: item.orderNumber }))]) {
    const match = order.order_number.match(/^MOL-(\d{4})-(\d{4,})$/);
    if (match?.[1] === String(currentYear)) {
      nextSequence = Math.max(nextSequence, Number(match[2]) + 1);
    }
  }

  for (const order of orders) {
    const owner = existingOwnerByNumber.get(order.orderNumber);
    const canKeep = order.orderNumber && !usedNumbers.has(order.orderNumber) && (!owner || owner === order.id);
    if (canKeep) {
      usedNumbers.add(order.orderNumber);
      continue;
    }

    let nextOrderNumber = "";
    do {
      nextOrderNumber = `MOL-${currentYear}-${String(nextSequence).padStart(4, "0")}`;
      nextSequence += 1;
    } while (usedNumbers.has(nextOrderNumber) || existingOwnerByNumber.has(nextOrderNumber));

    order.orderNumber = nextOrderNumber;
    usedNumbers.add(nextOrderNumber);
  }
}

export async function readData(): Promise<StoreData> {
  const [
    categoriesResult,
    productsResult,
    variantsResult,
    usersResult,
    ordersResult,
    orderItemsResult,
    settingsResult
  ] = await Promise.all([
    supabase.from("categories").select("id, name, slug, description").order("created_at", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, slug, description, price, discount_price, category_id, images, sizes, colors, stock_quantity, featured, active")
      .order("created_at", { ascending: false }),
    supabase
      .from("product_variants")
      .select("id, product_id, color_name, color_hex, images, sizes, stock, sku, price_override, active, position")
      .order("position", { ascending: true }),
    supabase.from("users").select("id, full_name, email, phone, role").order("created_at", { ascending: true }),
    supabase
      .from("orders")
      .select("id, order_number, customer_id, customer_name, customer_phone, city, address, notes, total, status, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("order_items")
      .select("order_id, product_id, variant_id, product_name, product_slug, image_url, size, color_name, color_hex, quantity, unit_price, sku, position")
      .order("position", { ascending: true }),
    supabase
      .from("store_settings")
      .select("whatsapp_number, contact_phone, contact_email, store_address, instagram_link, facebook_link, tiktok_link, snapchat_link")
      .eq("id", "default")
      .maybeSingle()
  ]);

  fail("select categories", categoriesResult.error);
  fail("select products", productsResult.error);
  fail("select product_variants", variantsResult.error);
  fail("select users", usersResult.error);
  fail("select orders", ordersResult.error);
  fail("select order_items", orderItemsResult.error);
  fail("select store_settings", settingsResult.error);

  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const row of ((variantsResult.data as DbProductVariant[] | null) || []).sort(byPositionThenId)) {
    const variants = variantsByProduct.get(row.product_id) || [];
    variants.push(mapVariant(row));
    variantsByProduct.set(row.product_id, variants);
  }

  const itemsByOrder = new Map<string, CartItem[]>();
  for (const row of ((orderItemsResult.data as DbOrderItem[] | null) || []).sort(byPositionThenId)) {
    const items = itemsByOrder.get(row.order_id) || [];
    items.push(mapOrderItem(row));
    itemsByOrder.set(row.order_id, items);
  }

  return {
    categories: ((categoriesResult.data as DbCategory[] | null) || []).map(mapCategory),
    products: ((productsResult.data as DbProduct[] | null) || []).map((product) => mapProduct(product, variantsByProduct.get(product.id) || [])),
    users: ((usersResult.data as DbUser[] | null) || []).map((user) => ({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone || undefined,
      role: user.role
    })),
    orders: ((ordersResult.data as DbOrder[] | null) || []).map((order) => mapOrder(order, itemsByOrder.get(order.id) || [])),
    settings: mapSettings((settingsResult.data as DbStoreSettings | null) || null)
  };
}

export async function writeData(data: StoreData) {
  for (const product of data.products) {
    ensureVariantIds(product);
  }
  await ensureUniqueOrderNumbers(data.orders);

  if (data.categories.length) {
    const { error: categoriesError } = await supabase.from("categories").upsert(
      data.categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description
      })),
      { onConflict: "id" }
    );
    fail("upsert categories", categoriesError);
  }

  if (data.products.length) {
    const { error: productsError } = await supabase.from("products").upsert(data.products.map(productRow), { onConflict: "id" });
    fail("upsert products", productsError);
  }

  const productIds = new Set(data.products.map((product) => product.id));
  const variantIds = new Set(data.products.flatMap((product) => (product.variants || []).map((variant) => variant.id)));

  for (const product of data.products) {
    const keepVariantIds = (product.variants || []).map((variant) => variant.id);
    if (keepVariantIds.length) {
      const { error } = await supabase.from("product_variants").delete().eq("product_id", product.id).not("id", "in", `(${keepVariantIds.join(",")})`);
      fail(`delete removed variants for product ${product.id}`, error);
    } else {
      const { error } = await supabase.from("product_variants").delete().eq("product_id", product.id);
      fail(`delete variants for product ${product.id}`, error);
    }
  }

  const variantRows = data.products.flatMap((product) => (product.variants || []).map((variant, index) => variantRow(product.id, variant, index)));
  if (variantRows.length) {
    const { error } = await supabase.from("product_variants").upsert(variantRows, { onConflict: "id" });
    fail("upsert product_variants", error);
  }

  if (data.users.length) {
    const { error: usersError } = await supabase.from("users").upsert(
      data.users.map((user) => ({
        id: user.id,
        full_name: user.fullName,
        email: user.email.toLowerCase(),
        phone: user.phone || null,
        role: user.role
      })),
      { onConflict: "id" }
    );
    fail("upsert users", usersError);
  }

  if (data.orders.length) {
    const { error: ordersError } = await supabase.from("orders").upsert(data.orders.map(orderRow), { onConflict: "id" });
    fail("upsert orders", ordersError);
  }

  const orderIds = data.orders.map((order) => order.id);
  if (orderIds.length) {
    const { error } = await supabase.from("order_items").delete().in("order_id", orderIds);
    fail("delete existing order_items", error);
  }

  const orderItemRows = data.orders.flatMap((order) =>
    order.items.map((item, index) => orderItemRow(order.id, item, index, productIds, variantIds))
  );
  if (orderItemRows.length) {
    const { error } = await supabase.from("order_items").insert(orderItemRows);
    fail("insert order_items", error);
  }

  const { error: settingsError } = await supabase.from("store_settings").upsert(settingsRow(data.settings), { onConflict: "id" });
  fail("upsert store_settings", settingsError);

  await deleteMissingRows("orders", data.orders.map((order) => order.id));
  await deleteMissingRows("products", data.products.map((product) => product.id));
  await deleteMissingRows("categories", data.categories.map((category) => category.id));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export async function findUserAuthByEmail(email: string): Promise<UserAuthRecord | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, phone, role, password_hash")
    .eq("email", normalizedEmail)
    .maybeSingle();
  fail("select user auth by email", error);

  const user = data as DbUserAuth | null;
  if (!user) return null;

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone || undefined,
    role: user.role,
    passwordHash: user.password_hash
  };
}

export async function createUserWithPasswordHash(user: UserAuthRecord) {
  const row = {
    id: user.id,
    full_name: user.fullName,
    email: user.email.toLowerCase(),
    phone: user.phone || null,
    role: user.role,
    password_hash: user.passwordHash
  };
  const { error } = await supabase.from("users").insert(row);
  fail("insert user", error);
}

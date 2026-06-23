export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  stockQuantity?: number;
  variants?: ProductVariant[];
  featured: boolean;
  active: boolean;
};

export type ProductVariant = {
  id: string;
  colorName: string;
  colorHex: string;
  images: string[];
  sizes: string[];
  stock: number;
  sku?: string;
  priceOverride?: number;
  active?: boolean;
};

export type CartItem = {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  color: string;
  colorHex?: string;
  quantity: number;
  price: number;
  sku?: string;
};

export type Customer = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
};

export type OrderStatus = "Pending" | "Confirmed" | "Preparing" | "Delivered" | "Cancelled";

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  notes?: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export type StoreSettings = {
  whatsappNumber: string;
  contactPhone: string;
  contactEmail: string;
  storeAddress: string;
  instagramLink: string;
  facebookLink: string;
  tiktokLink: string;
  snapchatLink: string;
};

export type StoreData = {
  products: Product[];
  categories: Category[];
  users: Array<Customer & { password: string }>;
  orders: Order[];
  settings: StoreSettings;
};

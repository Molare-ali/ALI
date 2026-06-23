import { promises as fs } from "fs";
import path from "path";
import { normalizeVariants } from "./product-utils";
import type { StoreData } from "./types";

const dataDir = path.join(process.cwd(), "data");
const bundledDataFile = path.join(dataDir, "molare-store.json");
const dataFile = process.env.MOLARE_DATA_FILE || (process.env.VERCEL ? path.join("/tmp", "molare-store.json") : bundledDataFile);

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

export const seedData: StoreData = {
  categories: [
    { id: "cat-suiting", name: "Suiting", slug: "suiting", description: "Tailored jackets, trousers, and ceremonial separates." },
    { id: "cat-shirts", name: "Shirts", slug: "shirts", description: "Crisp shirts, polos, and refined cotton layers." },
    { id: "cat-outerwear", name: "Outerwear", slug: "outerwear", description: "Men’s coats, jackets, and layering pieces with quiet structure." },
    { id: "cat-accessories", name: "Accessories", slug: "accessories", description: "Finishing details for a composed modern wardrobe." }
  ],
  products: [
    {
      id: "prod-roma-suit",
      name: "Roma Sartorial Suit",
      slug: "roma-sartorial-suit",
      description: "A modern two-piece suit cut for a clean shoulder, narrow waist, and composed evening presence.",
      price: 720,
      discountPrice: 650,
      categoryId: "cat-suiting",
      variants: [
        {
          id: "var-roma-onyx",
          colorName: "Onyx Black",
          colorHex: "#1A1A1A",
          images: [image("photo-1594938298603-c8148c4dae35"), image("photo-1507679799987-c73779587ccf")],
          sizes: ["46", "48", "50", "52", "54"],
          stock: 16,
          sku: "MOL-SUIT-ONX"
        },
        {
          id: "var-roma-aubergine",
          colorName: "Aubergine",
          colorHex: "#2D1B3D",
          images: [image("photo-1507679799987-c73779587ccf"), image("photo-1594938298603-c8148c4dae35")],
          sizes: ["46", "48", "50", "52"],
          stock: 10,
          sku: "MOL-SUIT-AUB",
          priceOverride: 690
        }
      ],
      featured: true,
      active: true
    },
    {
      id: "prod-milano-shirt",
      name: "Milano Poplin Shirt",
      slug: "milano-poplin-shirt",
      description: "A tailored men’s poplin shirt with a precise collar, clean cuff, and smooth everyday polish.",
      price: 155,
      categoryId: "cat-shirts",
      variants: [
        {
          id: "var-milano-avorio",
          colorName: "Avorio",
          colorHex: "#F5F1EA",
          images: [image("photo-1602810318383-e386cc2a3ccf"), image("photo-1598033129183-c4f50c736f10")],
          sizes: ["S", "M", "L", "XL", "XXL"],
          stock: 32,
          sku: "MOL-SHIRT-AVO"
        },
        {
          id: "var-milano-blue",
          colorName: "Pale Blue",
          colorHex: "#B9C8D8",
          images: [image("photo-1598033129183-c4f50c736f10"), image("photo-1602810318383-e386cc2a3ccf")],
          sizes: ["S", "M", "L", "XL"],
          stock: 18,
          sku: "MOL-SHIRT-BLU"
        }
      ],
      featured: true,
      active: true
    },
    {
      id: "prod-verona-coat",
      name: "Verona Wool Coat",
      slug: "verona-wool-coat",
      description: "A long men’s wool coat with quiet structure, refined drape, and a clean winter silhouette.",
      price: 690,
      categoryId: "cat-outerwear",
      variants: [
        {
          id: "var-verona-onyx",
          colorName: "Onyx Black",
          colorHex: "#1A1A1A",
          images: [image("photo-1617137968427-85924c800a22"), image("photo-1516257984-b1b4d707412e")],
          sizes: ["S", "M", "L", "XL"],
          stock: 14,
          sku: "MOL-COAT-ONX"
        },
        {
          id: "var-verona-plum",
          colorName: "Plum Royal",
          colorHex: "#4A2E5E",
          images: [image("photo-1516257984-b1b4d707412e"), image("photo-1617137968427-85924c800a22")],
          sizes: ["S", "M", "L"],
          stock: 8,
          sku: "MOL-COAT-PLM",
          priceOverride: 720
        }
      ],
      featured: true,
      active: true
    },
    {
      id: "prod-firenze-tee",
      name: "Firenze Mercerized T-Shirt",
      slug: "firenze-mercerized-t-shirt",
      description: "A premium men’s T-shirt in smooth mercerized cotton jersey with a refined neck line.",
      price: 95,
      categoryId: "cat-shirts",
      variants: [
        {
          id: "var-firenze-onyx",
          colorName: "Onyx Black",
          colorHex: "#1A1A1A",
          images: [image("photo-1521572163474-6864f9cf17ab"), image("photo-1503341504253-dff4815485f1")],
          sizes: ["S", "M", "L", "XL"],
          stock: 40,
          sku: "MOL-TEE-ONX"
        },
        {
          id: "var-firenze-avorio",
          colorName: "Avorio",
          colorHex: "#F5F1EA",
          images: [image("photo-1503341504253-dff4815485f1"), image("photo-1521572163474-6864f9cf17ab")],
          sizes: ["S", "M", "L", "XL"],
          stock: 26,
          sku: "MOL-TEE-AVO"
        }
      ],
      featured: false,
      active: true
    },
    {
      id: "prod-torino-trouser",
      name: "Torino Tailored Trouser",
      slug: "torino-tailored-trouser",
      description: "A tapered men’s trouser with a pressed front, clean waistband, and polished daily movement.",
      price: 180,
      categoryId: "cat-suiting",
      variants: [
        {
          id: "var-torino-charcoal",
          colorName: "Charcoal",
          colorHex: "#333333",
          images: [image("photo-1473966968600-fa801b869a1a"), image("photo-1516826957135-700dedea698c")],
          sizes: ["30", "32", "34", "36", "38"],
          stock: 24,
          sku: "MOL-TRS-CHR"
        },
        {
          id: "var-torino-aubergine",
          colorName: "Aubergine",
          colorHex: "#2D1B3D",
          images: [image("photo-1516826957135-700dedea698c"), image("photo-1473966968600-fa801b869a1a")],
          sizes: ["30", "32", "34", "36"],
          stock: 12,
          sku: "MOL-TRS-AUB"
        }
      ],
      featured: false,
      active: true
    },
    {
      id: "prod-napoli-polo",
      name: "Napoli Knit Polo",
      slug: "napoli-knit-polo",
      description: "A soft knit men’s polo with a structured collar and subtle luxury weight.",
      price: 135,
      categoryId: "cat-accessories",
      variants: [
        {
          id: "var-napoli-champagne",
          colorName: "Champagne",
          colorHex: "#C9A961",
          images: [image("photo-1586790170083-2f9ceadc732d"), image("photo-1618354691373-d851c5c3a990")],
          sizes: ["S", "M", "L", "XL"],
          stock: 22,
          sku: "MOL-POLO-CHM"
        },
        {
          id: "var-napoli-plum",
          colorName: "Plum Royal",
          colorHex: "#4A2E5E",
          images: [image("photo-1618354691373-d851c5c3a990"), image("photo-1586790170083-2f9ceadc732d")],
          sizes: ["M", "L", "XL"],
          stock: 11,
          sku: "MOL-POLO-PLM"
        }
      ],
      featured: false,
      active: true
    }
  ],
  users: [
    {
      id: "admin-1",
      fullName: "Molarè Admin",
      email: "admin@molare.test",
      phone: "+963000000000",
      role: "admin",
      password: "admin123"
    }
  ],
  orders: [],
  settings: {
    whatsappNumber: "963000000000",
    contactPhone: "+963 000 000 000",
    contactEmail: "atelier@molare.test",
    storeAddress: "Molarè Atelier, Damascus",
    instagramLink: "",
    facebookLink: "",
    tiktokLink: "",
    snapchatLink: ""
  }
};

const currentSeedIds = new Set(seedData.products.map((product) => product.id));
const legacySeedIds = new Set(["prod-velvet-blazer", "prod-ivory-shirt", "prod-wool-coat", "prod-silk-scarf"]);

async function ensureDb() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    try {
      const bundled = await fs.readFile(bundledDataFile, "utf8");
      await fs.writeFile(dataFile, bundled, "utf8");
    } catch {
      await fs.writeFile(dataFile, JSON.stringify(seedData, null, 2), "utf8");
    }
  }
}

function migrateData(data: StoreData) {
  let changed = false;

  if (data.products.some((product) => legacySeedIds.has(product.id))) {
    data.products = [
      ...seedData.products,
      ...data.products.filter((product) => !legacySeedIds.has(product.id) && !currentSeedIds.has(product.id))
    ];
    changed = true;
  }

  data.products = data.products.map((product) => {
    const normalized = normalizeVariants(product);
    if (!product.variants?.length) changed = true;
    return { ...product, variants: normalized };
  });

  data.users = data.users.map((user) => {
    if (user.fullName.includes("Ã")) {
      changed = true;
      return { ...user, fullName: user.fullName.replace("MolarÃ¨", "Molarè") };
    }
    return user;
  });

  if (data.settings.storeAddress.includes("Ã")) {
    data.settings.storeAddress = data.settings.storeAddress.replace("MolarÃ¨", "Molarè");
    changed = true;
  }

  return { data, changed };
}

export async function readData(): Promise<StoreData> {
  await ensureDb();
  const raw = await fs.readFile(dataFile, "utf8");
  const migrated = migrateData(JSON.parse(raw) as StoreData);
  if (migrated.changed) {
    await writeData(migrated.data);
  }
  return migrated.data;
}

export async function writeData(data: StoreData) {
  await ensureDb();
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
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

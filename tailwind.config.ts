import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        aubergine: "#2D1B3D",
        plum: "#4A2E5E",
        champagne: "#C9A961",
        ivory: "#F5F1EA",
        onyx: "#1A1A1A",
        linen: "#E9DDCF",
        smoke: "#D7C9BC"
      },
      fontFamily: {
        serifLuxury: ["Cormorant Garamond", "Garamond", "Georgia", "serif"],
        cinzel: ["Cinzel", "Trajan Pro", "Georgia", "serif"],
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"]
      },
      boxShadow: {
        luxury: "0 22px 70px rgba(45, 27, 61, 0.12)",
        gold: "0 10px 30px rgba(201, 169, 97, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;

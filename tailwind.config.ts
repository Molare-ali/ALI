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
        brandBlack: "#0F0F12",
        aubergine: "#2D1B3D",
        plum: "#4A2E5E",
        deepPurple: "#5A2D82",
        softPurple: "#EEE7F4",
        borderNeutral: "#D8D2DD",
        ivory: "#F7F5F2",
        onyx: "#1A1A1A",
        linen: "#EEE7F4",
        smoke: "#D8D2DD"
      },
      fontFamily: {
        serifLuxury: ["Cormorant Garamond", "Garamond", "Georgia", "serif"],
        cinzel: ["Cinzel", "Trajan Pro", "Georgia", "serif"],
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"]
      },
      boxShadow: {
        luxury: "0 22px 70px rgba(45, 27, 61, 0.12)",
        purple: "0 10px 30px rgba(90, 45, 130, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;

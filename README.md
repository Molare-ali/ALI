
# Molare Commerce

Luxury men's fashion e-commerce demo built with Next.js, TypeScript, Tailwind CSS, and a JSON-backed demo data layer.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo Admin

Email: `admin@molare.test`

Password: `admin123`

## Deploy

The easiest free deployment path is GitHub + Vercel:

1. Push this project to a GitHub repository.
2. Import the repository in Vercel.
3. Use the default settings:
   - Framework: Next.js
   - Build command: `npm run build`
   - Install command: `npm install`

Note: The included JSON data layer is for demo hosting. On Vercel, writes use temporary storage and may reset. For a production store, connect a hosted database such as Supabase or Neon.

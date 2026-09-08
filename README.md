# BuildYourPresence

Create. Customize. Publish. Grow.

BuildYourPresence is a no-code website builder for small businesses, local shops, and service providers who want a professional online presence without building a website from scratch.

## What it does

A business owner signs up, enters their business details, adds products or services, generates AI content, publishes their page, and gets a shareable public link. Customers can browse the page, add products to an order, and send the order via WhatsApp.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions)
- **AI:** Google Gemini API via Supabase Edge Function

## Deployment Guide

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project. Note your project URL and anon key.

### 2. Run database migrations

Apply the SQL files in `supabase/migrations/` in order using the Supabase SQL editor or MCP tools:

1. `20260809061935_create_bizkit_schema.sql` — creates `profiles`, `businesses`, and `products` tables with RLS policies
2. `20260809061946_add_triggers.sql` — auto-creates a profile row when a user signs up
3. `20260809062013_revoke_trigger_function_execute.sql` — secures the trigger function
4. `20260907154418_add_slug_hours_address_storage.sql` — adds slug, business hours, address columns and image storage bucket

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set the Gemini API key

Set the `AI_API_KEY` secret on your Supabase project (via the Supabase dashboard or CLI). This key is used by the `ai-generate` edge function to call the Gemini API. It is never exposed to the frontend.

Optionally set `AI_MODEL` to override the default model (`gemini-flash-latest`).

### 5. Deploy the edge function

Deploy the `ai-generate` edge function using the Supabase MCP deploy tool or Supabase dashboard. The `supabase/config.toml` file configures the function with JWT verification enabled.

### 6. Build and deploy the frontend

```bash
npm install
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, etc.). Make sure the hosting provider supports client-side routing (SPA fallback to `index.html`).

## How publishing works

When a business owner clicks "Publish", the `published` boolean is set to `true` on their business row. The public page at `/b/{slug}` becomes accessible. There is no per-business deployment — all business pages are dynamic routes within the single deployed application.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # Authentication and business state
├── lib/            # API, Supabase, types, storage, SEO helpers
├── pages/          # Application pages and public business page
supabase/
├── config.toml     # Edge function configuration
├── functions/      # Edge function source (ai-generate)
└── migrations/     # Database schema, policies, and triggers
```

Built for small businesses.

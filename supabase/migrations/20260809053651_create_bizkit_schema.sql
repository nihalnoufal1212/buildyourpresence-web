/*
# BizKit core schema

Creates the three core tables for the BizKit small-business starter kit:
profiles, businesses, and products.

## 1. New Tables

### profiles
- `id` (uuid, PK, references auth.users) — one row per signed-up user
- `email` (text) — cached for convenience
- `created_at` (timestamptz)

### businesses
- `id` (uuid, PK)
- `owner_id` (uuid, NOT NULL, DEFAULT auth.uid(), references auth.users) — the owner
- `name` (text, NOT NULL)
- `tagline` (text)
- `description` (text)
- `industry` (text)
- `location` (text)
- `logo_url` (text)
- `primary_color` (text) — hex color used on the public page
- `contact_method` (text) — whatsapp | phone | email | link
- `contact_value` (text) — the phone/email/url matching the method
- `published` (boolean, DEFAULT false) — whether the public page is live
- `faqs` (jsonb, DEFAULT '[]') — generated/edited FAQ pairs
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### products
- `id` (uuid, PK)
- `business_id` (uuid, NOT NULL, references businesses, ON DELETE CASCADE)
- `name` (text, NOT NULL)
- `description` (text)
- `price` (numeric(12,2))
- `image_url` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## 2. Security (RLS)

- profiles: owner-only CRUD (authenticated, auth.uid() = id).
- businesses:
  - SELECT: anon + authenticated can read published businesses OR their own.
  - INSERT/UPDATE/DELETE: authenticated owner only.
- products:
  - SELECT: anon + authenticated can read products whose parent business is
    published OR owned by the caller.
  - INSERT/UPDATE/DELETE: authenticated owner of the parent business only.

This keeps owner data private while letting public business pages render
without authentication.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  tagline text,
  description text,
  industry text,
  location text,
  logo_url text,
  primary_color text DEFAULT '#0f766e',
  contact_method text DEFAULT 'whatsapp',
  contact_value text,
  published boolean NOT NULL DEFAULT false,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_businesses" ON businesses;
CREATE POLICY "select_businesses" ON businesses FOR SELECT
  TO anon, authenticated
  USING (published = true OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_business" ON businesses;
CREATE POLICY "insert_own_business" ON businesses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_business" ON businesses;
CREATE POLICY "update_own_business" ON businesses FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_business" ON businesses;
CREATE POLICY "delete_own_business" ON businesses FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(12,2),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_products" ON products;
CREATE POLICY "select_products" ON products FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = products.business_id
      AND (businesses.published = true OR businesses.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = products.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = products.business_id
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = products.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = products.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS businesses_owner_id_idx ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS products_business_id_idx ON products(business_id);

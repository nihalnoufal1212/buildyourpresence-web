/*
# Add slug, business hours, address, and image storage

## Summary

Enhances the businesses table to support human-readable public URLs,
business hours display, and physical address for directions. Also creates
a Supabase Storage bucket for business logo and product image uploads.

## 1. New Columns on `businesses`

- `slug` (text, unique) — human-readable URL identifier (e.g. "green-leaf-bakery").
  Generated from business name. Used in public URL `/b/{slug}`.
  Nullable so existing rows don't break; will be backfilled below.
- `business_hours` (jsonb, default '[]') — array of 7 day objects:
  { day: "monday", open: "09:00", close: "18:00", closed: false }
  Empty array means no hours set (section hidden on public page).
- `address` (text) — physical address for "Get Directions" maps link.
  Distinct from `location` which is a general area/city label.

## 2. Backfill

For every existing business row without a slug, generate one from the
business name: lowercase, hyphenated, non-alphanumerics removed, with a
short random suffix to ensure uniqueness.

## 3. Indexes

- UNIQUE index on `slug` (partial — only where slug IS NOT NULL) to
  enforce uniqueness and speed up public page lookups.

## 4. Storage

- Create bucket `business-images` (public) for logos and product photos.
- Policies: authenticated users can upload/update/delete to a path
  starting with their user ID; anyone can read (public bucket).

## 5. Security

- RLS already enabled on businesses; existing policies cover new columns
  (SELECT/INSERT/UPDATE/DELETE are column-agnostic in Postgres RLS).
- Storage policies are separate from table RLS.
*/

-- Add new columns
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_hours jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address text;

-- Backfill slugs for existing rows
DO $$
DECLARE
  r RECORD;
  base_slug text;
  final_slug text;
  suffix text;
  attempts int;
BEGIN
  FOR r IN SELECT id, name FROM businesses WHERE slug IS NULL LOOP
    base_slug := lower(r.name);
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := 'business';
    END IF;

    final_slug := base_slug;
    attempts := 0;
    LOOP
      IF NOT EXISTS (SELECT 1 FROM businesses WHERE slug = final_slug) THEN
        EXIT;
      END IF;
      attempts := attempts + 1;
      suffix := substr(md5(random()::text), 1, 4);
      final_slug := base_slug || '-' || suffix;
      IF attempts > 10 THEN
        final_slug := base_slug || '-' || substr(md5(r.id::text), 1, 8);
        EXIT;
      END IF;
    END LOOP;

    UPDATE businesses SET slug = final_slug WHERE id = r.id;
  END LOOP;
END $$;

-- Unique index on slug (partial — only non-null)
CREATE UNIQUE INDEX IF NOT EXISTS businesses_slug_key
  ON businesses (slug)
  WHERE slug IS NOT NULL;

-- Storage bucket for business images
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users manage their own folder, public can read
DROP POLICY IF EXISTS "business_images_read" ON storage.objects;
CREATE POLICY "business_images_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'business-images');

DROP POLICY IF EXISTS "business_images_insert" ON storage.objects;
CREATE POLICY "business_images_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "business_images_update" ON storage.objects;
CREATE POLICY "business_images_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'business-images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'business-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "business_images_delete" ON storage.objects;
CREATE POLICY "business_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'business-images' AND (storage.foldername(name))[1] = auth.uid()::text);

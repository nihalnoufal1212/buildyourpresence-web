import { supabase } from '@/lib/supabase';
import type { Business, Product, ContactMethod, Faq, DayHours } from '@/lib/types';

export async function fetchBusinessForOwner(
  ownerId: string
): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) throw error;
  return data as Business | null;
}

export async function fetchBusinessById(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Business | null;
}

export async function fetchBusinessBySlug(
  slug: string
): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as Business | null;
}

export function slugify(name: string): string {
  let s = name.toLowerCase().trim();
  s = s.replace(/[^a-z0-9\s-]/g, '');
  s = s.replace(/\s+/g, '-');
  s = s.replace(/-+/g, '-');
  s = s.replace(/^-+|-+$/g, '');
  if (!s) s = 'business';
  return s;
}

export async function checkSlugAvailability(
  slug: string,
  excludeBusinessId?: string
): Promise<boolean> {
  let query = supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug);
  if (excludeBusinessId) {
    query = query.neq('id', excludeBusinessId);
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return !data;
}

export async function generateUniqueSlug(
  name: string,
  excludeBusinessId?: string
): Promise<string> {
  const base = slugify(name);
  if (await checkSlugAvailability(base, excludeBusinessId)) return base;

  for (let i = 1; i <= 20; i++) {
    const candidate = `${base}-${i}`;
    if (await checkSlugAvailability(candidate, excludeBusinessId)) {
      return candidate;
    }
  }

  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${random}`;
}

export interface BusinessInput {
  name: string;
  slug?: string | null;
  tagline?: string | null;
  description?: string | null;
  industry?: string | null;
  location?: string | null;
  address?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  contact_method?: ContactMethod;
  contact_value?: string | null;
  published?: boolean;
  faqs?: Faq[];
  business_hours?: DayHours[];
}

export async function createBusiness(
  input: BusinessInput
): Promise<Business> {
  const { data, error } = await supabase
    .from('businesses')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Business;
}

export async function updateBusiness(
  id: string,
  input: Partial<BusinessInput>
): Promise<Business> {
  const { data, error } = await supabase
    .from('businesses')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Business;
}

export async function fetchProducts(businessId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export interface ProductInput {
  name: string;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
}

export async function createProduct(
  businessId: string,
  input: ProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...input, business_id: businessId })
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

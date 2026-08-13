import { supabase } from '@/lib/supabase';
import type { Business, Product, ContactMethod, Faq } from '@/lib/types';

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

export interface BusinessInput {
  name: string;
  tagline?: string | null;
  description?: string | null;
  industry?: string | null;
  location?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  contact_method?: ContactMethod;
  contact_value?: string | null;
  published?: boolean;
  faqs?: Faq[];
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

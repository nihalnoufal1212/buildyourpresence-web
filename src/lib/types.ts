export interface Business {
  id: string;
  owner_id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  location: string | null;
  logo_url: string | null;
  primary_color: string | null;
  contact_method: ContactMethod;
  contact_value: string | null;
  published: boolean;
  faqs: Faq[];
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export type ContactMethod = 'whatsapp' | 'phone' | 'email' | 'link';

export interface Profile {
  id: string;
  email: string | null;
  created_at: string;
}

export type AiAction =
  | 'business_description'
  | 'tagline'
  | 'product_description'
  | 'faqs';

export interface AiGenerateParams {
  action: AiAction;
  business_name?: string;
  industry?: string;
  location?: string;
  description?: string;
  product_name?: string;
  product_description?: string;
  language?: string;
}

export const INDUSTRIES = [
  'Home Bakery',
  'Restaurant / Cafe',
  'Salon / Spa',
  'Tutoring',
  'Freelance Services',
  'Clothing / Fashion',
  'Handmade Crafts',
  'Local Shop',
  'Fitness / Wellness',
  'Photography',
  'Other',
] as const;

export const CONTACT_METHODS: {
  value: ContactMethod;
  label: string;
  placeholder: string;
  help: string;
}[] = [
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    placeholder: 'e.g. +91 98765 43210',
    help: 'Customers will open a WhatsApp chat with you.',
  },
  {
    value: 'phone',
    label: 'Phone call',
    placeholder: 'e.g. +91 98765 43210',
    help: 'Customers will call this number directly.',
  },
  {
    value: 'email',
    label: 'Email',
    placeholder: 'e.g. hello@mybusiness.com',
    help: 'Customers will email this address.',
  },
  {
    value: 'link',
    label: 'External link',
    placeholder: 'e.g. https://myorder.com/shop',
    help: 'Customers will visit this ordering or website link.',
  },
];

export const COLOR_PRESETS = [
  '#0f766e',
  '#1d4ed8',
  '#b45309',
  '#be123c',
  '#4338ca',
  '#15803d',
  '#c2410c',
  '#0e7490',
];

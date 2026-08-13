import type { Business, Product, ContactMethod } from '@/lib/types';
import {
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  MapPin,
  Package,
  HelpCircle,
} from 'lucide-react';

export function contactHref(
  method: ContactMethod,
  value: string | null
): string | null {
  if (!value) return null;
  const clean = value.trim();
  switch (method) {
    case 'whatsapp': {
      const digits = clean.replace(/[^\d]/g, '');
      const text = encodeURIComponent(
        `Hi! I'd like to know more about your products.`
      );
      return `https://wa.me/${digits}?text=${text}`;
    }
    case 'phone':
      return `tel:${clean.replace(/\s+/g, '')}`;
    case 'email':
      return `mailto:${clean}`;
    case 'link':
      return clean.startsWith('http') ? clean : `https://${clean}`;
    default:
      return null;
  }
}

export function contactLabel(method: ContactMethod): string {
  switch (method) {
    case 'whatsapp':
      return 'Chat on WhatsApp';
    case 'phone':
      return 'Call to Order';
    case 'email':
      return 'Email Us';
    case 'link':
      return 'Order Online';
    default:
      return 'Contact';
  }
}

export function ContactIcon({ method }: { method: ContactMethod }) {
  switch (method) {
    case 'whatsapp':
      return <MessageCircle size={18} />;
    case 'phone':
      return <Phone size={18} />;
    case 'email':
      return <Mail size={18} />;
    case 'link':
      return <ExternalLink size={18} />;
    default:
      return <Phone size={18} />;
  }
}

function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '';
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(price);
  return `₹${formatted}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function PublicBusinessPage({
  business,
  products,
}: {
  business: Business;
  products: Product[];
}) {
  const accent = business.primary_color || '#0f766e';
  const contactUrl = contactHref(business.contact_method, business.contact_value);
  const faqs = business.faqs ?? [];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: accent }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.3) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 py-12 text-center sm:py-16">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.name}
              className="mx-auto h-20 w-20 rounded-2xl border-4 border-white/30 object-cover shadow-lg sm:h-24 sm:w-24"
            />
          ) : (
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white/30 bg-white/20 text-2xl font-bold text-white shadow-lg sm:h-24 sm:w-24 sm:text-3xl"
            >
              {getInitials(business.name)}
            </div>
          )}
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {business.name}
          </h1>
          {business.tagline && (
            <p className="mx-auto mt-2 max-w-xl text-lg text-white/90 sm:text-xl">
              {business.tagline}
            </p>
          )}
          {business.location && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/80">
              <MapPin size={15} />
              {business.location}
            </p>
          )}
          {contactUrl && (
            <a
              href={contactUrl}
              target={business.contact_method === 'link' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold shadow-lg transition hover:scale-105 hover:shadow-xl"
              style={{ color: accent }}
            >
              <ContactIcon method={business.contact_method} />
              {contactLabel(business.contact_method)}
            </a>
          )}
        </div>
      </header>

      {/* About */}
      {business.description && (
        <section className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-stone-400">
              About
            </h2>
            <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-stone-700">
              {business.description}
            </p>
            {business.industry && (
              <span
                className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: `${accent}15`,
                  color: accent,
                }}
              >
                {business.industry}
              </span>
            )}
          </div>
        </section>
      )}

      {/* Products */}
      {products.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          <div className="mb-6 flex items-center gap-2">
            <Package size={20} style={{ color: accent }} />
            <h2 className="text-2xl font-bold text-stone-900">
              {business.industry &&
              (business.industry.toLowerCase().includes('menu') ||
                business.industry.toLowerCase().includes('restaurant') ||
                business.industry.toLowerCase().includes('cafe') ||
                business.industry.toLowerCase().includes('bakery'))
                ? 'Our Menu'
                : 'Our Products'}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-40 w-full items-center justify-center text-3xl font-bold"
                    style={{ backgroundColor: `${accent}12`, color: accent }}
                  >
                    {getInitials(p.name)}
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-stone-900">
                      {p.name}
                    </h3>
                    {p.price !== null && p.price !== undefined && (
                      <span
                        className="shrink-0 text-lg font-bold"
                        style={{ color: accent }}
                      >
                        {formatPrice(p.price)}
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                      {p.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          <div className="mb-6 flex items-center gap-2">
            <HelpCircle size={20} style={{ color: accent }} />
            <h2 className="text-2xl font-bold text-stone-900">FAQ</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-stone-900">{faq.question}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact footer */}
      <section className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: accent }}
        >
          <h2 className="text-2xl font-bold text-white">Get in touch</h2>
          <p className="mt-2 text-white/80">
            We'd love to hear from you. Reach out using your preferred method.
          </p>
          {contactUrl && (
            <a
              href={contactUrl}
              target={business.contact_method === 'link' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold transition hover:scale-105"
              style={{ color: accent }}
            >
              <ContactIcon method={business.contact_method} />
              {contactLabel(business.contact_method)}
            </a>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-stone-400">
          {business.name} · Powered by BizKit
        </p>
      </section>
    </div>
  );
}

import { useState } from 'react';
import type { Business, Product, ContactMethod } from '@/lib/types';
import {
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  MapPin,
  Package,
  HelpCircle,
  Clock,
  Plus,
  Minus,
  ShoppingCart,
  X,
  Navigation,
} from 'lucide-react';
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppContactMessage,
  buildWhatsAppUrl,
  formatPrice,
  isOpenNow,
  formatTime,
  dayLabel,
  type CartItem,
} from '@/lib/whatsapp';

export function contactHref(
  method: ContactMethod,
  value: string | null
): string | null {
  if (!value) return null;
  const clean = value.trim();
  switch (method) {
    case 'whatsapp': {
      const digits = clean.replace(/[^\d]/g, '');
      return buildWhatsAppUrl(digits, buildWhatsAppContactMessage({} as Business));
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

export function directionsHref(address: string | null, location: string | null): string | null {
  const query = address || location;
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function PublicBusinessPage({
  business,
  products,
}: {
  business: Business;
  products: Product[];
}) {
  const accent = business.primary_color || '#0f766e';
  const faqs = business.faqs ?? [];
  const hours = business.business_hours ?? [];
  const hasProducts = products.length > 0;
  const isWhatsApp = business.contact_method === 'whatsapp';
  const phoneDigits = business.contact_value?.replace(/[^\d]/g, '') || '';

  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const cartItems: CartItem[] = products
    .filter((p) => cart[p.id] > 0)
    .map((p) => ({ product: p, quantity: cart[p.id] }));

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
    0
  );

  function addToCart(productId: string) {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const next = { ...prev };
      if (next[productId] > 1) {
        next[productId] -= 1;
      } else {
        delete next[productId];
      }
      return next;
    });
  }

  function handleOrderOnWhatsApp() {
    if (cartItems.length === 0) return;
    const message = buildWhatsAppOrderMessage(business, cartItems);
    const url = buildWhatsAppUrl(phoneDigits, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleContactOnly() {
    if (!business.contact_value) return;
    const message = buildWhatsAppContactMessage(business);
    const url = buildWhatsAppUrl(phoneDigits, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const open = isOpenNow(hours);

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
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-white/80">
            {business.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} />
                {business.location}
              </span>
            )}
            {hours.length > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  open ? 'bg-green-500/90 text-white' : 'bg-stone-900/40 text-white'
                }`}
              >
                <Clock size={12} />
                {open ? 'Open now' : 'Closed now'}
              </span>
            )}
          </div>
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
      {hasProducts && (
        <section className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          <div className="mb-6 flex items-center gap-2">
            <Package size={20} style={{ color: accent }} />
            <h2 className="text-2xl font-bold text-stone-900">
              {getMenuLabel(business.industry)}
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
                        ₹{formatPrice(p.price)}
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                      {p.description}
                    </p>
                  )}
                  {isWhatsApp && p.price !== null && (
                    <button
                      onClick={() => addToCart(p.id)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: accent }}
                    >
                      <Plus size={14} />
                      Add to order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Business Hours */}
      {hours.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          <div className="mb-6 flex items-center gap-2">
            <Clock size={20} style={{ color: accent }} />
            <h2 className="text-2xl font-bold text-stone-900">Hours</h2>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-2.5">
              {hours.map((h) => (
                <div
                  key={h.day}
                  className="flex items-center justify-between border-b border-stone-100 pb-2.5 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium capitalize text-stone-700">
                    {h.day}
                  </span>
                  {h.closed ? (
                    <span className="text-sm text-stone-400">Closed</span>
                  ) : (
                    <span className="text-sm text-stone-600">
                      {formatTime(h.open)} — {formatTime(h.close)}
                    </span>
                  )}
                </div>
              ))}
            </div>
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
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {isWhatsApp && (
              <a
                href={buildWhatsAppUrl(phoneDigits, buildWhatsAppContactMessage(business))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold transition hover:scale-105"
                style={{ color: accent }}
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            )}
            {business.contact_method === 'phone' && business.contact_value && (
              <a
                href={`tel:${business.contact_value.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold transition hover:scale-105"
                style={{ color: accent }}
              >
                <Phone size={18} />
                Call us
              </a>
            )}
            {business.contact_method === 'email' && business.contact_value && (
              <a
                href={`mailto:${business.contact_value}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold transition hover:scale-105"
                style={{ color: accent }}
              >
                <Mail size={18} />
                Email us
              </a>
            )}
            {business.contact_method === 'link' && business.contact_value && (
              <a
                href={business.contact_value.startsWith('http') ? business.contact_value : `https://${business.contact_value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold transition hover:scale-105"
                style={{ color: accent }}
              >
                <ExternalLink size={18} />
                Visit link
              </a>
            )}
            {directionsHref(business.address, business.location) && (
              <a
                href={directionsHref(business.address, business.location)!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                <Navigation size={18} />
                Get directions
              </a>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-stone-400">
          {business.name} · Powered by BizKit
        </p>
      </section>

      {/* Floating cart bar */}
      {isWhatsApp && hasProducts && cartCount > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 px-4">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:scale-105"
            style={{ backgroundColor: accent }}
          >
            <ShoppingCart size={18} />
            {cartCount} item{cartCount === 1 ? '' : 's'}
            <span className="rounded-full bg-white/25 px-2.5 py-0.5">
              ₹{formatPrice(cartTotal)}
            </span>
          </button>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">Your order</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100"
              >
                <X size={20} />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-500">
                Your order is empty. Add some items first.
              </p>
            ) : (
              <>
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 rounded-xl border border-stone-200 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-stone-900">
                          {item.product.name}
                        </h3>
                        {item.product.price !== null && (
                          <p className="text-xs text-stone-500">
                            ₹{formatPrice(item.product.price)} each
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition hover:bg-stone-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item.product.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition hover:bg-stone-100"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {item.product.price !== null && (
                        <span className="w-16 text-right text-sm font-bold text-stone-900">
                          ₹{formatPrice(item.product.price * item.quantity)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {cartTotal > 0 && (
                  <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                    <span className="font-semibold text-stone-900">Total</span>
                    <span
                      className="text-xl font-bold"
                      style={{ color: accent }}
                    >
                      ₹{formatPrice(cartTotal)}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleOrderOnWhatsApp}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle size={18} />
                  Order on WhatsApp
                </button>
                <p className="mt-2 text-center text-xs text-stone-400">
                  This will open WhatsApp with your order details pre-filled.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getMenuLabel(industry: string | null): string {
  if (!industry) return 'Our Products';
  const lower = industry.toLowerCase();
  if (
    lower.includes('restaurant') ||
    lower.includes('cafe') ||
    lower.includes('bakery')
  ) {
    return 'Our Menu';
  }
  if (lower.includes('salon') || lower.includes('spa')) {
    return 'Our Services';
  }
  if (lower.includes('clinic') || lower.includes('pharmacy')) {
    return 'Our Services';
  }
  if (lower.includes('tutor') || lower.includes('coach')) {
    return 'Our Programs';
  }
  if (lower.includes('fitness') || lower.includes('gym')) {
    return 'Our Plans';
  }
  return 'Our Products';
}

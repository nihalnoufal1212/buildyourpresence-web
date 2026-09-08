import type { Business, Product } from '@/lib/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export function buildWhatsAppOrderMessage(
  business: Business,
  items: CartItem[]
): string {
  const lines: string[] = [];
  lines.push(`Hi ${business.name}! I'd like to place an order:`);
  lines.push('');

  let total = 0;
  for (const item of items) {
    const price = item.product.price ?? 0;
    const lineTotal = price * item.quantity;
    total += lineTotal;
    const priceText =
      item.product.price !== null
        ? ` — ₹${formatPrice(lineTotal)}`
        : '';
    lines.push(`• ${item.product.name} × ${item.quantity}${priceText}`);
  }

  lines.push('');
  if (total > 0) {
    lines.push(`Total: ₹${formatPrice(total)}`);
    lines.push('');
  }
  lines.push('Please confirm availability and pickup/delivery. Thank you!');

  return lines.join('\n');
}

export function buildWhatsAppContactMessage(business: Business): string {
  return `Hi ${business.name}! I'd like to know more about your services.`;
}

export function buildWhatsAppUrl(
  phone: string,
  message: string
): string {
  const digits = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(n);
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export function dayLabel(day: string): string {
  return DAY_LABELS[day] || day;
}

export function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  if (h === undefined) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

export function isOpenNow(hours: { day: string; open: string; close: string; closed: boolean }[]): boolean {
  if (!hours || hours.length === 0) return false;
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[now.getDay()];
  const entry = hours.find((h) => h.day === today);
  if (!entry || entry.closed) return false;
  if (!entry.open || !entry.close) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = entry.open.split(':').map(Number);
  const [closeH, closeM] = entry.close.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

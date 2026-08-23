import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchBusinessById, fetchProducts } from '@/lib/api';
import type { Business, Product } from '@/lib/types';
import { PublicBusinessPage } from '@/components/PublicBusinessPage';
import { Spinner } from '@/components/ui';
import { Sparkles, Store } from 'lucide-react';

export function PublicPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    let active = true;
    setLoading(true);
    setNotFound(false);

    (async () => {
      try {
        const biz = await fetchBusinessById(businessId);
        if (!active) return;
        if (!biz || !biz.published) {
          setNotFound(true);
          setBusiness(null);
          return;
        }
        setBusiness(biz);
        const prods = await fetchProducts(biz.id);
        if (!active) return;
        setProducts(prods);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [businessId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-50">
        <Spinner size={32} />
        <p className="text-sm text-stone-500">Loading business page…</p>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-200 text-stone-400">
          <Store size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Business not found
          </h1>
          <p className="mt-2 max-w-sm text-stone-500">
            This business page doesn't exist or hasn't been published yet.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          <Sparkles size={16} />
          Go to BizKit
        </Link>
      </div>
    );
  }

  return <PublicBusinessPage business={business} products={products} />;
}

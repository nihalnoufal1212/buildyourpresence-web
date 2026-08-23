import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Package,
  Wand2,
  Eye,
  Globe,
  Check,
  Circle,
  ArrowRight,
  PencilLine,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBusiness } from '@/context/BusinessContext';
import { fetchBusinessForOwner, fetchProducts } from '@/lib/api';
import type { Product } from '@/lib/types';
import { OwnerShell, EmptyState, ErrorState, Spinner } from '@/components/ui';
import { Button } from '@/components/Button';

export function DashboardPage() {
  const { session } = useAuth();
  const { business, setBusiness, loading, setLoading } = useBusiness();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const biz = await fetchBusinessForOwner(session.user.id);
      setBusiness(biz);
      if (biz) {
        const prods = await fetchProducts(biz.id);
        setProducts(prods);
      } else {
        setProducts([]);
      }
    } catch {
      setError('Could not load your business. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasProfile = !!business;
  const hasCatalog = products.length > 0;
  const hasContent = !!(
    business &&
    (business.tagline || business.description || business.faqs?.length)
  );
  const isPublished = business?.published ?? false;

  const steps = [
    { label: 'Business Profile', done: hasProfile, to: '/app/setup' },
    { label: 'Catalog', done: hasCatalog, to: '/app/catalog' },
    { label: 'Content', done: hasContent, to: '/app/content' },
    { label: 'Publish', done: isPublished, to: '/app/preview' },
  ];

  if (loading) {
    return (
      <OwnerShell>
        <div className="flex justify-center py-20">
          <Spinner size={28} />
        </div>
      </OwnerShell>
    );
  }

  if (error) {
    return (
      <OwnerShell>
        <ErrorState message={error} onRetry={load} />
      </OwnerShell>
    );
  }

  if (!hasProfile) {
    return (
      <OwnerShell>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Welcome to BizKit
          </h1>
          <p className="mt-2 text-stone-600">
            Let's set up your business page. It only takes a few minutes.
          </p>
          <div className="mt-8">
            <EmptyState
              icon={<Store size={40} />}
              title="No business yet"
              description="Create your business profile to start building your public page."
              action={
                <Link to="/app/setup">
                  <Button className="mt-2">
                    Create your business
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              }
            />
          </div>
        </div>
      </OwnerShell>
    );
  }

  return (
    <OwnerShell>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              Your Business
            </h1>
            <p className="mt-1 text-stone-600">
              Manage your page, products, and publishing.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
              isPublished
                ? 'bg-teal-100 text-teal-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isPublished ? <Check size={15} /> : <Circle size={8} />}
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Business card */}
        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl text-xl font-bold text-white"
                style={{ backgroundColor: business.primary_color || '#0f766e' }}
              >
                {business.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-bold text-stone-900">
                {business.name}
              </h2>
              {business.tagline && (
                <p className="mt-0.5 truncate text-sm text-stone-500">
                  {business.tagline}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {business.industry && (
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                    {business.industry}
                  </span>
                )}
                {business.location && (
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                    {business.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-8">
          <h3 className="text-sm font-bold uppercase tracking-wide text-stone-400">
            Progress
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {steps.map((step) => (
              <Link
                key={step.label}
                to={step.to}
                className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white p-3.5 transition hover:border-teal-300 hover:shadow-sm"
              >
                {step.done ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <Check size={15} />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-stone-200 text-stone-300">
                    <Circle size={6} className="fill-stone-300 text-stone-300" />
                  </div>
                )}
                <span
                  className={`text-sm font-medium ${
                    step.done ? 'text-stone-900' : 'text-stone-500'
                  }`}
                >
                  {step.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h3 className="text-sm font-bold uppercase tracking-wide text-stone-400">
            Quick actions
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard
              icon={<PencilLine size={20} />}
              title="Edit Business"
              desc="Update your profile details"
              to="/app/setup"
            />
            <ActionCard
              icon={<Package size={20} />}
              title="Manage Catalog"
              desc={`${products.length} product${products.length === 1 ? '' : 's'}`}
              to="/app/catalog"
            />
            <ActionCard
              icon={<Wand2 size={20} />}
              title="Generate Content"
              desc="AI descriptions & FAQs"
              to="/app/content"
            />
            <ActionCard
              icon={isPublished ? <Eye size={20} /> : <Globe size={20} />}
              title={isPublished ? 'View Page' : 'Preview & Publish'}
              desc={isPublished ? 'See your live page' : 'Review then go live'}
              to="/app/preview"
            />
          </div>
        </div>

        {isPublished && (
          <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center">
            <p className="font-semibold text-teal-800">
              Your business is live!
            </p>
            <p className="mt-1 text-sm text-teal-700">
              Share this link with your customers:
            </p>
            <div className="mx-auto mt-3 max-w-md">
              <a
                href={`/b/${business.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-teal-700 ring-1 ring-teal-200 transition hover:bg-teal-50"
              >
                {window.location.origin}/b/{business.id}
              </a>
            </div>
          </div>
        )}
      </div>
    </OwnerShell>
  );
}

function ActionCard({
  icon,
  title,
  desc,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-100">
        {icon}
      </div>
      <h4 className="mt-3 font-semibold text-stone-900">{title}</h4>
      <p className="mt-0.5 text-sm text-stone-500">{desc}</p>
    </Link>
  );
}

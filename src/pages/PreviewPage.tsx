import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Globe,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { fetchProducts, updateBusiness } from '@/lib/api';
import type { Product } from '@/lib/types';
import { OwnerShell, EmptyState, Spinner, ErrorState } from '@/components/ui';
import { Button } from '@/components/Button';
import { PublicBusinessPage } from '@/components/PublicBusinessPage';
import { useToast } from '@/components/Toast';

export function PreviewPage() {
  const { business, setBusiness } = useBusiness();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    if (!business) return;
    setLoading(true);
    setError(null);
    try {
      const prods = await fetchProducts(business.id);
      setProducts(prods);
    } catch {
      setError('Could not load your page preview.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [business?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePublish() {
    if (!business) return;
    setPublishing(true);
    try {
      const updated = await updateBusiness(business.id, {
        published: !business.published,
      });
      setBusiness(updated);
      toast(
        updated.published
          ? 'Your business is live!'
          : 'Your page is now unpublished.'
      );
    } catch {
      toast('Could not update publish status.', 'error');
    } finally {
      setPublishing(false);
    }
  }

  function copyLink() {
    if (!business) return;
    const url = `${window.location.origin}/b/${business.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast('Link copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    });
  }

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

  if (!business) {
    return (
      <OwnerShell>
        <EmptyState
          icon={<Eye size={40} />}
          title="No business to preview"
          description="Create your business profile first."
          action={
            <Link to="/app/setup">
              <Button className="mt-2">
                Go to Business Setup
                <ArrowLeft size={16} />
              </Button>
            </Link>
          }
        />
      </OwnerShell>
    );
  }

  const publicUrl = `${window.location.origin}/b/${business.id}`;

  return (
    <OwnerShell>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Preview & Publish
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              This is how your page looks to customers. Review it, then publish.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/app">
              <Button variant="ghost">
                <ArrowLeft size={16} />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                business.published
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Globe size={14} />
              {business.published ? 'Published' : 'Draft'}
            </span>
            {business.published && (
              <div className="flex items-center gap-2">
                <code className="hidden truncate rounded-lg bg-stone-100 px-3 py-1.5 text-xs text-stone-600 sm:block">
                  {publicUrl}
                </code>
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  <ExternalLink size={13} />
                  Open
                </a>
              </div>
            )}
          </div>
          <Button
            onClick={handlePublish}
            loading={publishing}
            variant={business.published ? 'danger' : 'primary'}
          >
            {business.published ? 'Unpublish' : 'Publish Business'}
          </Button>
        </div>

        {/* Published confirmation banner */}
        {business.published && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
              <Check size={20} />
            </div>
            <div>
              <p className="font-semibold text-teal-800">
                Your business is live!
              </p>
              <p className="text-sm text-teal-700">
                Share this link with your customers:{' '}
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  {publicUrl}
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Warnings */}
        {!business.description && products.length === 0 && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={18} className="shrink-0" />
            Your page is empty. Add a description and some products before
            publishing for the best result.
          </div>
        )}

        {/* Preview */}
        <div className="mt-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-stone-400">
            Preview
          </p>
          <div className="overflow-hidden rounded-2xl border border-stone-300 shadow-lg">
            <div className="flex items-center gap-1.5 border-b border-stone-200 bg-stone-100 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-3 truncate text-xs text-stone-400">
                {publicUrl}
              </span>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <PublicBusinessPage business={business} products={products} />
            </div>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}

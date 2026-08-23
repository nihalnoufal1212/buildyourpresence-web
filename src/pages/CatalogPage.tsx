import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowRight,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/api';
import type { Product } from '@/lib/types';
import { OwnerShell, EmptyState, Spinner, ErrorState } from '@/components/ui';
import { Button } from '@/components/Button';
import { AiButton } from '@/components/AiButton';
import { useToast } from '@/components/Toast';
import { useLockBodyScroll } from '@/components/ui';

interface EditState {
  id: string | null;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

const EMPTY: EditState = {
  id: null,
  name: '',
  description: '',
  price: '',
  imageUrl: '',
};

export function CatalogPage() {
  const { business } = useBusiness();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  useLockBodyScroll(!!editing || !!confirmDelete);

  async function load() {
    if (!business) return;
    setLoading(true);
    setError(null);
    try {
      const prods = await fetchProducts(business.id);
      setProducts(prods);
    } catch {
      setError('Could not load your products.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [business?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function openAdd() {
    setEditing({ ...EMPTY });
  }
  function openEdit(p: Product) {
    setEditing({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price !== null ? String(p.price) : '',
      imageUrl: p.image_url || '',
    });
  }

  async function handleSave() {
    if (!editing || !business) return;
    if (!editing.name.trim()) {
      toast('Product name is required.', 'error');
      return;
    }

    const priceNum = editing.price.trim()
      ? parseFloat(editing.price)
      : null;
    if (priceNum !== null && (isNaN(priceNum) || priceNum < 0)) {
      toast('Enter a valid price.', 'error');
      return;
    }

    setSaving(true);
    try {
      const input = {
        name: editing.name.trim(),
        description: editing.description.trim() || null,
        price: priceNum,
        image_url: editing.imageUrl.trim() || null,
      };
      if (editing.id) {
        const updated = await updateProduct(editing.id, input);
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        toast('Product updated.');
      } else {
        const created = await createProduct(business.id, input);
        setProducts((prev) => [...prev, created]);
        toast('Product added.');
      }
      setEditing(null);
    } catch {
      toast('Could not save the product.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteProduct(confirmDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      toast('Product deleted.');
      setConfirmDelete(null);
    } catch {
      toast('Could not delete the product.', 'error');
    }
  }

  if (!business) {
    return (
      <OwnerShell>
        <EmptyState
          icon={<Package size={40} />}
          title="Set up your business first"
          description="Add your business profile before adding products."
          action={
            <Link to="/app/setup">
              <Button className="mt-2">
                Go to Business Setup
                <ArrowRight size={16} />
              </Button>
            </Link>
          }
        />
      </OwnerShell>
    );
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

  return (
    <OwnerShell>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Product Catalog
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Add the products or services you offer.
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus size={16} />
            Add product
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<Package size={40} />}
              title="No products yet"
              description="Add your first product or service to showcase on your page."
              action={
                <Button onClick={openAdd} className="mt-2">
                  <Plus size={16} />
                  Add your first product
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl text-lg font-bold"
                    style={{
                      backgroundColor: `${business.primary_color}12`,
                      color: business.primary_color || '#0f766e',
                    }}
                  >
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-semibold text-stone-900">
                      {p.name}
                    </h3>
                    {p.price !== null && p.price !== undefined && (
                      <span className="shrink-0 font-bold text-teal-700">
                        ₹{formatNum(p.price)}
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                      {p.description}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(p)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-8 flex justify-end">
            <Link to="/app/content">
              <Button variant="secondary">
                Next: Generate content
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? 'Edit product' : 'Add product'}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                Product name <span className="text-red-500">*</span>
              </label>
              <input
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                placeholder="e.g. Chocolate Cake"
                className={inputCls}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Description
                </label>
                <AiButton
                  params={{
                    action: 'product_description',
                    business_name: business.name,
                    industry: business.industry || undefined,
                    product_name: editing.name,
                    product_description: editing.description,
                  }}
                  onResult={(r) =>
                    r.description &&
                    setEditing({ ...editing, description: r.description })
                  }
                  disabled={!editing.name.trim()}
                >
                  Generate
                </AiButton>
              </div>
              <textarea
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                placeholder="Describe the product for your customers."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                  ₹
                </span>
                <input
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: e.target.value })
                  }
                  placeholder="699"
                  inputMode="decimal"
                  className={`${inputCls} pl-7`}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                Image URL (optional)
              </label>
              <input
                value={editing.imageUrl}
                onChange={(e) =>
                  setEditing({ ...editing, imageUrl: e.target.value })
                }
                placeholder="https://…"
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing.id ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal
          onClose={() => setConfirmDelete(null)}
          title="Delete product?"
          small
        >
          <p className="text-sm text-stone-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-stone-900">
              {confirmDelete.name}
            </span>
            ? This cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </OwnerShell>
  );
}

function formatNum(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);
}

const inputCls =
  'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20';

function Modal({
  children,
  onClose,
  title,
  small,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  small?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${
          small ? 'max-w-sm' : 'max-w-lg'
        } rounded-2xl bg-white p-6 shadow-2xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

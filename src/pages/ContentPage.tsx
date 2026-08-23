import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wand2, Trash2, Plus, ArrowRight, HelpCircle, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBusiness } from '@/context/BusinessContext';
import { fetchBusinessForOwner, updateBusiness } from '@/lib/api';
import type { Faq } from '@/lib/types';
import { OwnerShell, EmptyState, Spinner, ErrorState } from '@/components/ui';
import { Button } from '@/components/Button';
import { AiButton } from '@/components/AiButton';
import { useToast } from '@/components/Toast';

export function ContentPage() {
  const { session } = useAuth();
  const { business, setBusiness } = useBusiness();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [faqs, setFaqs] = useState<Faq[]>([]);

  async function load() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const biz = await fetchBusinessForOwner(session.user.id);
      if (biz) {
        setBusiness(biz);
        setTagline(biz.tagline || '');
        setDescription(biz.description || '');
        setFaqs(biz.faqs ?? []);
      }
    } catch {
      setError('Could not load your content.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!business) return;
    setSaving(true);
    try {
      const updated = await updateBusiness(business.id, {
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        faqs: faqs,
      });
      setBusiness(updated);
      toast('Content saved.');
    } catch {
      toast('Could not save content.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function generateFaqs() {
    if (!business) return;
    // The AI button handles the actual generation; this is a manual add
    setFaqs([...faqs, { question: '', answer: '' }]);
  }

  function updateFaq(i: number, field: keyof Faq, value: string) {
    setFaqs((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, [field]: value } : f))
    );
  }

  function removeFaq(i: number) {
    setFaqs((prev) => prev.filter((_, idx) => idx !== i));
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
          icon={<Wand2 size={40} />}
          title="Set up your business first"
          description="Create your business profile before generating content."
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

  return (
    <OwnerShell>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Wand2 size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Generate Content
            </h1>
            <p className="text-sm text-stone-500">
              Use AI to write your tagline, description, and FAQs. You can edit
              everything before publishing.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Tagline */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900">Tagline</h2>
              <AiButton
                params={{
                  action: 'tagline',
                  business_name: business.name,
                  industry: business.industry || undefined,
                  description,
                }}
                onResult={(r) => r.tagline && setTagline(r.tagline)}
              >
                Generate
              </AiButton>
            </div>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A short memorable line about your business"
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900">
                Business description
              </h2>
              <AiButton
                params={{
                  action: 'business_description',
                  business_name: business.name,
                  industry: business.industry || undefined,
                  location: business.location || undefined,
                  description,
                }}
                onResult={(r) =>
                  r.description && setDescription(r.description)
                }
              >
                Generate
              </AiButton>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers what you do and what makes you special."
              rows={5}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* FAQs */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-stone-400" />
                <h2 className="font-semibold text-stone-900">FAQs</h2>
              </div>
              <div className="flex gap-2">
                <AiButton
                  params={{
                    action: 'faqs',
                    business_name: business.name,
                    industry: business.industry || undefined,
                    location: business.location || undefined,
                    description,
                  }}
                  onResult={(r) =>
                    r.faqs && r.faqs.length > 0 && setFaqs(r.faqs)
                  }
                >
                  Generate FAQs
                </AiButton>
                <Button
                  variant="secondary"
                  onClick={generateFaqs}
                  className="px-3 py-1.5"
                >
                  <Plus size={15} />
                  Add
                </Button>
              </div>
            </div>

            {faqs.length === 0 ? (
              <p className="rounded-xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-400">
                No FAQs yet. Generate them with AI or add your own.
              </p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-stone-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <input
                        value={faq.question}
                        onChange={(e) => updateFaq(i, 'question', e.target.value)}
                        placeholder="Question"
                        className={`${inputCls} mb-2 font-medium`}
                      />
                      <button
                        onClick={() => removeFaq(i)}
                        className="mt-1 shrink-0 rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                      placeholder="Answer"
                      rows={2}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-stone-200 pt-6">
            <Link to="/app/catalog">
              <Button variant="ghost">Back to catalog</Button>
            </Link>
            <div className="flex gap-2">
              <Button onClick={handleSave} loading={saving}>
                <Save size={16} />
                Save content
              </Button>
              <Link to="/app/preview">
                <Button variant="secondary">
                  Preview
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}

const inputCls =
  'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20';

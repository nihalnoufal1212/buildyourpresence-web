import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Store, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBusiness } from '@/context/BusinessContext';
import {
  fetchBusinessForOwner,
  createBusiness,
  updateBusiness,
  slugify,
  checkSlugAvailability,
  generateUniqueSlug,
} from '@/lib/api';
import {
  INDUSTRIES,
  CONTACT_METHODS,
  COLOR_PRESETS,
  DAYS_OF_WEEK,
  type ContactMethod,
  type DayHours,
} from '@/lib/types';
import { OwnerShell, Spinner, ErrorState } from '@/components/ui';
import { Button } from '@/components/Button';
import { AiButton } from '@/components/AiButton';
import { ImageUpload } from '@/components/ImageUpload';
import { useToast } from '@/components/Toast';

function defaultHours(): DayHours[] {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    open: '09:00',
    close: '18:00',
    closed: day === 'sunday',
  }));
}

export function BusinessSetupPage() {
  const { session } = useAuth();
  const { business, setBusiness } = useBusiness();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState(COLOR_PRESETS[0]);
  const [contactMethod, setContactMethod] = useState<ContactMethod>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [hours, setHours] = useState<DayHours[]>(defaultHours());
  const [hoursEnabled, setHoursEnabled] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const biz = await fetchBusinessForOwner(session.user.id);
      if (biz) {
        setBusiness(biz);
        setName(biz.name || '');
        setSlug(biz.slug || '');
        setSlugEdited(!!biz.slug);
        setIndustry(biz.industry || '');
        setLocation(biz.location || '');
        setAddress(biz.address || '');
        setDescription(biz.description || '');
        setTagline(biz.tagline || '');
        setLogoUrl(biz.logo_url || null);
        setPrimaryColor(biz.primary_color || COLOR_PRESETS[0]);
        setContactMethod(biz.contact_method || 'whatsapp');
        setContactValue(biz.contact_value || '');
        if (biz.business_hours && biz.business_hours.length > 0) {
          setHours(biz.business_hours);
          setHoursEnabled(true);
        }
      }
    } catch {
      setError('Could not load your business details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!slugEdited && name.trim()) {
      setSlug(slugify(name));
    }
  }, [name, slugEdited]);

  useEffect(() => {
    if (!slug.trim()) {
      setSlugAvailable(true);
      return;
    }
    let active = true;
    const timeout = setTimeout(async () => {
      try {
        const available = await checkSlugAvailability(
          slugify(slug),
          business?.id
        );
        if (active) setSlugAvailable(available);
      } catch {
        // ignore
      }
    }, 400);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [slug, business?.id]);

  function updateHour(day: string, field: keyof DayHours, value: string | boolean) {
    setHours((prev) =>
      prev.map((h) =>
        h.day === day ? { ...h, [field]: value } : h
      )
    );
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Business name is required.');
      return;
    }
    if (!contactValue.trim()) {
      setFormError('Contact information is required so customers can reach you.');
      return;
    }

    let finalSlug = slug.trim() ? slugify(slug) : '';
    if (finalSlug) {
      if (!slugAvailable) {
        setFormError('That URL is already taken. Try a different one.');
        return;
      }
    } else {
      finalSlug = await generateUniqueSlug(name, business?.id);
    }

    setSaving(true);
    try {
      const input = {
        name: name.trim(),
        slug: finalSlug,
        industry: industry || null,
        location: location.trim() || null,
        address: address.trim() || null,
        description: description.trim() || null,
        tagline: tagline.trim() || null,
        logo_url: logoUrl,
        primary_color: primaryColor,
        contact_method: contactMethod,
        contact_value: contactValue.trim(),
        business_hours: hoursEnabled ? hours : [],
      };

      if (business) {
        const updated = await updateBusiness(business.id, input);
        setBusiness(updated);
      } else {
        const created = await createBusiness({
          ...input,
          owner_id: session!.user.id,
        } as typeof input & { owner_id: string });
        setBusiness(created);
      }
      toast('Business saved.');
      navigate('/app');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not save your business.';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
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

  const contactConfig = CONTACT_METHODS.find((m) => m.value === contactMethod)!;

  return (
    <OwnerShell>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Store size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              {business ? 'Edit Business' : 'Business Setup'}
            </h1>
            <p className="text-sm text-stone-500">
              Tell customers who you are and how to reach you.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-8 space-y-6">
          {/* Basics */}
          <Section title="The basics">
            <Field label="Business name" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Green Leaf Bakery"
                className={inputCls}
              />
            </Field>
            <Field
              label="Public URL"
              help={`${window.location.origin}/b/${slug.trim() ? slugify(slug) : 'your-business'}`}
            >
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-stone-400">
                  /b/
                </span>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                  placeholder="green-leaf-bakery"
                  className={inputCls}
                />
              </div>
              {slugEdited && slug.trim() && !slugAvailable && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  This URL is already taken. Try another.
                </p>
              )}
              {slugEdited && slug.trim() && slugAvailable && (
                <p className="mt-1.5 text-xs font-medium text-teal-600">
                  This URL is available.
                </p>
              )}
            </Field>
            <Field label="Business type / industry">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={inputCls}
              >
                <option value="">Select a category</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location" help="General area or city shown on your page.">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Vijayawada"
                className={inputCls}
              />
            </Field>
            <Field label="Address" help="Full street address — used for 'Get Directions' on your page.">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 MG Road, Labbipet, Vijayawada, AP 520010"
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </Section>

          {/* Description */}
          <Section
            title="About your business"
            action={
              name.trim() && (
                <div className="flex gap-2">
                  <AiButton
                    params={{
                      action: 'tagline',
                      business_name: name,
                      industry,
                      description,
                    }}
                    onResult={(r) => r.tagline && setTagline(r.tagline)}
                  >
                    Tagline
                  </AiButton>
                  <AiButton
                    params={{
                      action: 'business_description',
                      business_name: name,
                      industry,
                      location,
                      description,
                    }}
                    onResult={(r) =>
                      r.description && setDescription(r.description)
                    }
                  >
                    Description
                  </AiButton>
                </div>
              )
            }
          >
            <Field label="Tagline">
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="A short memorable line about your business"
                className={inputCls}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers what you do and what makes you special."
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </Section>

          {/* Logo */}
          <Section title="Logo">
            <ImageUpload
              value={logoUrl}
              onChange={setLogoUrl}
              kind="logo"
              label="Upload your business logo (JPG, PNG, WebP — max 4 MB)"
              shape="square"
              size={96}
            />
          </Section>

          {/* Contact */}
          <Section title="How customers reach you">
            <Field label="Contact method">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CONTACT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setContactMethod(m.value)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      contactMethod === m.value
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field
              label={contactConfig.label + ' details'}
              required
              help={contactConfig.help}
            >
              <input
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={contactConfig.placeholder}
                className={inputCls}
              />
            </Field>
          </Section>

          {/* Business Hours */}
          <Section
            title="Business hours"
            action={
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={hoursEnabled}
                  onChange={(e) => setHoursEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600"
                />
                Show hours
              </label>
            }
          >
            {hoursEnabled ? (
              <div className="space-y-2">
                {hours.map((h) => (
                  <div
                    key={h.day}
                    className="flex items-center gap-3 rounded-lg border border-stone-200 px-3 py-2"
                  >
                    <span className="w-24 shrink-0 text-sm font-medium capitalize text-stone-700">
                      {h.day}
                    </span>
                    <label className="flex items-center gap-1.5 text-xs text-stone-500">
                      <input
                        type="checkbox"
                        checked={!h.closed}
                        onChange={(e) => updateHour(h.day, 'closed', !e.target.checked)}
                        className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600"
                      />
                      Open
                    </label>
                    {!h.closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={h.open}
                          onChange={(e) => updateHour(h.day, 'open', e.target.value)}
                          className="rounded-lg border border-stone-300 px-2 py-1 text-sm text-stone-700 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                        />
                        <span className="text-xs text-stone-400">to</span>
                        <input
                          type="time"
                          value={h.close}
                          onChange={(e) => updateHour(h.day, 'close', e.target.value)}
                          className="rounded-lg border border-stone-300 px-2 py-1 text-sm text-stone-700 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                        />
                      </div>
                    )}
                    {h.closed && (
                      <span className="text-xs font-medium text-stone-400">
                        Closed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-stone-400">
                <Clock size={16} />
                Enable to add opening hours to your page.
              </div>
            )}
          </Section>

          {/* Branding */}
          <Section title="Branding">
            <Field label="Primary brand color">
              <div className="flex flex-wrap items-center gap-2.5">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPrimaryColor(c)}
                    className={`h-9 w-9 rounded-full border-2 transition ${
                      primaryColor === c
                        ? 'border-stone-900 ring-2 ring-stone-300'
                        : 'border-white shadow-sm'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-full border border-stone-300"
                />
              </div>
            </Field>
          </Section>

          {formError && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/app')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Save size={16} />
              Save business
            </Button>
          </div>
        </form>

        {!business && (
          <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-stone-400">
            After saving, you'll add your products next.
            <ArrowRight size={14} />
          </p>
        )}
      </div>
    </OwnerShell>
  );
}

const inputCls =
  'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20';

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-stone-900">{title}</h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {help && <p className="mt-1.5 text-xs text-stone-400">{help}</p>}
    </div>
  );
}

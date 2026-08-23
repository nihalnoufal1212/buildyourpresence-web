import { useState, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { generateContent } from '@/lib/ai';
import type { AiGenerateParams } from '@/lib/types';
import { useToast } from '@/components/Toast';

interface Props {
  params: AiGenerateParams;
  onResult: (data: {
    tagline?: string;
    description?: string;
    faqs?: { question: string; answer: string }[];
  }) => void;
  children: ReactNode;
  label?: string;
  disabled?: boolean;
}

export function AiButton({ params, onResult, children, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generateContent(params);
      onResult(result);
      toast('Content generated. Review and edit before saving.');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not generate content.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={disabled || loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700 transition hover:border-teal-300 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-300 border-t-teal-700" />
      ) : (
        <Sparkles size={15} />
      )}
      {children}
    </button>
  );
}

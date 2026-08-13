import { supabase } from './supabase';
import type { AiGenerateParams, AiAction } from './types';

interface AiResult {
  tagline?: string;
  description?: string;
  faqs?: { question: string; answer: string }[];
}

/**
 * Calls the ai-generate edge function to produce marketing content.
 * Returns structured JSON. The owner can edit results before saving.
 */
export async function generateContent(
  params: AiGenerateParams
): Promise<AiResult> {
  const { data, error } = await supabase.functions.invoke<AiResult | { error: string }>(
    'ai-generate',
    { body: params }
  );

  if (error) {
    throw new Error(
      error.message || 'Could not reach the AI service. Please try again.'
    );
  }

  if (!data) {
    throw new Error('No response received from the AI service.');
  }

  if (data && typeof data === 'object' && 'error' in data) {
    const errData = data as unknown as { error: string };
    if (errData.error) throw new Error(errData.error);
  }

  // Edge function returns { result: {...} }
  const wrapped = data as unknown as { result?: AiResult; error?: string };
  if (wrapped.error) throw new Error(wrapped.error);
  if (wrapped.result) return wrapped.result;

  // If already unwrapped
  return data as AiResult;
}

export type { AiAction };

// ai-generate: Gemini native REST API implementation
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenContentResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; code?: number; status?: string };
}

async function geminiGenerate(
  prompt: string,
  apiKey: string,
  model: string
): Promise<string> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  const data: GenContentResponse = await resp.json();

  if (!resp.ok) {
    const msg = data.error?.message ?? `Gemini API error ${resp.status}`;
    throw new Error(`AI service error: ${msg}`);
  }

  if (data.promptFeedback?.blockReason) {
    throw new Error(
      `AI service blocked the request: ${data.promptFeedback.blockReason}`
    );
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("AI service returned no content. Please try again.");
  }
  return text.trim();
}

function extractJson(text: string): unknown {
  let cleaned = text.trim();
  // Strip Markdown code fences if present
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) cleaned = fence[1].trim();
  // Find the first { or [ and the matching last } or ]
  const first = cleaned.search(/[{[]/);
  if (first === -1) throw new Error("AI did not return valid JSON.");
  const last = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  if (last === -1) throw new Error("AI did not return valid JSON.");
  return JSON.parse(cleaned.slice(first, last + 1));
}

function buildPrompt(params: {
  action: string;
  business_name?: string;
  industry?: string;
  location?: string;
  description?: string;
  product_name?: string;
  product_description?: string;
  language?: string;
}): string {
  const lang = params.language || "English";
  const biz = params.business_name || "this business";
  const industry = params.industry || "a small local business";
  const location = params.location ? ` in ${params.location}` : "";
  const ctx = params.description ? `\nContext: ${params.description}` : "";

  switch (params.action) {
    case "tagline":
      return `You are a marketing copywriter for small businesses. Write ONE short catchy tagline (max 10 words) for "${biz}", a ${industry}${location}. Respond in ${lang}.${ctx}\nReturn JSON: {"tagline":"your tagline here"}`;

    case "business_description":
      return `You are a marketing copywriter for small businesses. Write a warm, engaging description (2-3 sentences, max 60 words) for "${biz}", a ${industry}${location}. Respond in ${lang}.${ctx}\nReturn JSON: {"description":"your description here"}`;

    case "product_description":
      return `You are a marketing copywriter. Write a short appealing product description (1-2 sentences, max 40 words) for "${params.product_name || "this product"}" from "${biz}", a ${industry}${location}. Respond in ${lang}.${params.product_description ? `\nProduct context: ${params.product_description}` : ""}\nReturn JSON: {"description":"your description here"}`;

    case "faqs":
      return `You are a marketing copywriter for small businesses. Create 3 frequently asked questions with helpful answers for "${biz}", a ${industry}${location}. Respond in ${lang}.${ctx}\nReturn JSON: {"faqs":[{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}]}`;

    default:
      throw new Error(`Unknown action: ${params.action}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("AI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "AI is not configured yet. Add an AI_API_KEY secret to enable content generation.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI_MODEL if set and not a deprecated model; otherwise default to latest.
    const configuredModel = Deno.env.get("AI_MODEL");
    const model = configuredModel && !configuredModel.includes("2.5-flash")
      ? configuredModel
      : "gemini-flash-latest";

    const params = await req.json();
    if (!params.action) {
      return new Response(
        JSON.stringify({ error: "Missing 'action' in request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(params);
    const text = await geminiGenerate(prompt, apiKey, model);
    const result = extractJson(text);

    return new Response(
      JSON.stringify({ result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

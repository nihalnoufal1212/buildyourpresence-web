const DEFAULT_OG_IMAGE = 'https://bolt.new/static/og_default.png';

export function setDocumentMeta(opts: {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}): void {
  const { title, description, image, url } = opts;

  document.title = title;

  setMeta('description', description || '');
  setMeta('og:title', title, true);
  setMeta('og:description', description || '', true);
  setMeta('og:type', 'website', true);
  setMeta('og:image', image || DEFAULT_OG_IMAGE, true);
  if (url) setMeta('og:url', url, true);
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description || '');
  setMeta('twitter:image', image || DEFAULT_OG_IMAGE);
}

function setMeta(name: string, content: string, isProperty = false): void {
  const attr = isProperty ? 'property' : 'name';
  let el = document.head.querySelector(
    `meta[${attr}="${name}"]`
  ) as HTMLMetaElement | null;

  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function resetDocumentMeta(): void {
  document.title = 'BizKit — Digital starter kit for small businesses';
  setMeta('description', 'Create a professional website for your local business in minutes.');
  setMeta('og:title', 'BizKit', true);
  setMeta('og:description', 'Create a professional website for your local business in minutes.', true);
  setMeta('og:type', 'website', true);
  setMeta('og:image', DEFAULT_OG_IMAGE, true);
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', 'BizKit');
  setMeta('twitter:description', 'Create a professional website for your local business in minutes.');
  setMeta('twitter:image', DEFAULT_OG_IMAGE);
}

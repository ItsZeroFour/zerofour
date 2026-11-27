import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { asMedia, getSite } from '@/lib/content';

export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return new Response(null, { status: 404 });
  const site = await getSite(locale);
  const media = asMedia(site.resume);
  if (!media || media.mimeType !== 'application/pdf') return new Response(null, { status: 404 });
  let url: URL;
  try { url = new URL(media.url!, request.url); } catch { return new Response(null, { status: 404 }); }
  const local = new URL(request.url);
  const allowed = url.origin === local.origin || url.hostname.endsWith('.public.blob.vercel-storage.com');
  if (!allowed || !['http:', 'https:'].includes(url.protocol)) return new Response(null, { status: 404 });
  try {
    const file = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!file.ok || !file.body) return new Response(null, { status: 502 });
    return new Response(file.body, { headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ZeroFour-CV-${locale}.pdf"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch { return new Response(null, { status: 502 }); }
}

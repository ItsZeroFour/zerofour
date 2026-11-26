import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withPayload } from '@payloadcms/next/withPayload';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const blobStoreId = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([a-z\d]+)_/i)?.[1]?.toLowerCase();

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: blobStoreId ? [{ protocol: 'https', hostname: `${blobStoreId}.public.blob.vercel-storage.com`, pathname: '/**' }] : [],
  },
};

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false });

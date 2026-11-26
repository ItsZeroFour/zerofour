import type { CollectionConfig } from 'payload';
import { revalidateSite } from '../hooks/revalidate';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: { ru: 'Файл', en: 'File' }, plural: { ru: 'Медиа', en: 'Media' } },
  admin: {
    group: { ru: 'Контент', en: 'Content' },
    description: {
      ru: 'Скриншоты проектов, портреты, PDF резюме. Картинки автоматически сжимаются в WebP.',
      en: 'Project screenshots, portraits, résumé PDF. Images are converted to WebP automatically.',
    },
  },
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'video/webm', 'application/pdf'],
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [
      { name: 'thumb', width: 640, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'card', width: 1280, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'wide', width: 2400, formatOptions: { format: 'webp', options: { quality: 80 } } },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: { format: 'jpeg', options: { quality: 82 } },
      },
    ],
  },
  hooks: {
    afterChange: [revalidateSite],
  },
  fields: [
    {
      name: 'alt',
      label: { ru: 'Описание для незрячих (alt)', en: 'Alt text' },
      type: 'text',
      localized: true,
      admin: {
        description: {
          ru: 'Что изображено. Для декоративных картинок оставьте пустым.',
          en: 'What is shown. Leave empty for decorative images.',
        },
      },
    },
  ],
};

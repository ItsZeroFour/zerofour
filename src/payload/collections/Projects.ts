import type { CollectionConfig } from 'payload';
import { revalidateSite, revalidateSiteOnDelete } from '../hooks/revalidate';

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: { ru: 'Проект', en: 'Project' }, plural: { ru: 'Проекты', en: 'Projects' } },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'featured', 'order', '_status'],
    group: { ru: 'Контент', en: 'Content' },
    description: {
      ru: 'Кейсы портфолио. Порядок на сайте — по полю «Порядок». Черновики на сайте не видны.',
      en: 'Portfolio cases. Sorted by “Order”. Drafts are hidden from the site.',
    },
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  hooks: {
    afterChange: [revalidateSite],
    afterDelete: [revalidateSiteOnDelete],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { ru: 'Основное', en: 'Main' },
          fields: [
            {
              name: 'title',
              label: { ru: 'Название', en: 'Title' },
              type: 'text',
              required: true,
              localized: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'client',
                  label: { ru: 'Клиент / контекст', en: 'Client / context' },
                  type: 'text',
                  localized: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'year',
                  label: { ru: 'Годы', en: 'Years' },
                  type: 'text',
                  admin: { width: '25%', placeholder: '2023 — 2025' },
                },
                {
                  name: 'role',
                  label: { ru: 'Моя роль', en: 'My role' },
                  type: 'text',
                  localized: true,
                  admin: { width: '25%' },
                },
              ],
            },
            {
              name: 'summary',
              label: { ru: 'Коротко (1–2 предложения)', en: 'Summary (1–2 sentences)' },
              type: 'textarea',
              required: true,
              localized: true,
              maxLength: 280,
            },
            {
              name: 'highlights',
              label: { ru: 'Что сделал', en: 'What I did' },
              type: 'array',
              localized: true,
              labels: { singular: { ru: 'Пункт', en: 'Item' }, plural: { ru: 'Пункты', en: 'Items' } },
              fields: [{ name: 'text', label: { ru: 'Текст', en: 'Text' }, type: 'textarea', required: true }],
            },
            {
              name: 'metrics',
              label: { ru: 'Результат в цифрах', en: 'Results in numbers' },
              type: 'array',
              maxRows: 4,
              labels: { singular: { ru: 'Цифра', en: 'Metric' }, plural: { ru: 'Цифры', en: 'Metrics' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'value',
                      label: { ru: 'Значение', en: 'Value' },
                      type: 'text',
                      required: true,
                      localized: true,
                      admin: { width: '35%', placeholder: '100 000+' },
                    },
                    {
                      name: 'label',
                      label: { ru: 'Подпись', en: 'Label' },
                      type: 'text',
                      required: true,
                      localized: true,
                      admin: { width: '65%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'stack',
              label: { ru: 'Стек', en: 'Stack' },
              type: 'text',
              hasMany: true,
              admin: { description: { ru: 'Enter после каждой технологии', en: 'Press Enter after each item' } },
            },
          ],
        },
        {
          label: { ru: 'Разбор решения', en: 'Engineering story' },
          fields: [
            { name: 'challenge', label: { ru: 'Задача и ограничения', en: 'Problem and constraints' }, type: 'textarea', localized: true },
            { name: 'decision', label: { ru: 'Моё решение и почему', en: 'My decision and why' }, type: 'textarea', localized: true },
            { name: 'outcome', label: { ru: 'Что получилось', en: 'What followed' }, type: 'textarea', localized: true },
            {
              name: 'stages', type: 'array', localized: true, maxRows: 6,
              label: { ru: 'Сценарий интерфейса (без обложки)', en: 'Interface flow (without cover)' },
              fields: [
                { name: 'title', type: 'text', required: true, label: { ru: 'Этап', en: 'Stage' } },
                { name: 'text', type: 'textarea', label: { ru: 'Что происходит', en: 'What happens' } },
              ],
            },
          ],
        },
        {
          label: { ru: 'Медиа', en: 'Media' },
          fields: [
            {
              name: 'cover',
              label: { ru: 'Обложка (скриншот 16:10)', en: 'Cover (16:10 screenshot)' },
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'image/' } },
            },
            {
              name: 'gallery',
              label: { ru: 'Галерея', en: 'Gallery' },
              type: 'array',
              labels: { singular: { ru: 'Кадр', en: 'Shot' }, plural: { ru: 'Кадры', en: 'Shots' } },
              fields: [
                { name: 'image', label: { ru: 'Файл', en: 'File' }, type: 'upload', relationTo: 'media', required: true, filterOptions: { mimeType: { contains: 'image/' } } },
                { name: 'caption', label: { ru: 'Подпись', en: 'Caption' }, type: 'text', localized: true },
              ],
            },
          ],
        },
        {
          label: { ru: 'Ссылки', en: 'Links' },
          fields: [
            { name: 'liveUrl', label: { ru: 'Живой сайт', en: 'Live site' }, type: 'text' },
            { name: 'repoUrl', label: { ru: 'Репозиторий', en: 'Repository' }, type: 'text' },
            {
              name: 'nda',
              label: { ru: 'Под NDA (ссылки не показывать)', en: 'Under NDA (hide links)' },
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      label: { ru: 'Адрес (slug)', en: 'Slug' },
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: { ru: 'Латиницей. Пусто — создастся из названия.', en: 'Latin. Empty — generated from title.' },
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string' && value.trim()) return slugify(value);
            const title = data?.title;
            return typeof title === 'string' ? slugify(title) : value;
          },
        ],
      },
    },
    {
      name: 'order',
      label: { ru: 'Порядок', en: 'Order' },
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: { ru: 'Меньше — выше', en: 'Lower comes first' } },
    },
    {
      name: 'featured',
      label: { ru: 'Главный проект (крупно)', en: 'Featured (large)' },
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
};

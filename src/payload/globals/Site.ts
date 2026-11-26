import type { GlobalConfig } from 'payload';
import { revalidateGlobal } from '../hooks/revalidate';

/** Редакционное содержимое обложки, профиля и контактов. */
export const Site: GlobalConfig = {
  slug: 'site',
  label: { ru: 'Сайт: обложка и профиль', en: 'Site: cover & profile' },
  admin: { group: { ru: 'Контент', en: 'Content' } },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { ru: 'Обложка', en: 'Cover' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', label: { ru: 'Имя', en: 'Name' }, type: 'text', required: true, localized: true },
                { name: 'role', label: { ru: 'Профессия', en: 'Role' }, type: 'text', required: true, localized: true },
              ],
            },
            {
              name: 'lead',
              label: { ru: 'Главный абзац', en: 'Lead paragraph' },
              type: 'textarea',
              required: true,
              localized: true,
              maxLength: 220,
            },
            {
              type: 'row',
              fields: [
                { name: 'cta', label: { ru: 'Текст кнопки', en: 'Button label' }, type: 'text', required: true, localized: true },
                {
                  name: 'clients',
                  label: { ru: 'Делал для (через ·)', en: 'Built for (use ·)' },
                  type: 'text',
                  localized: true,
                },
              ],
            },
            {
              name: 'portrait',
              label: { ru: 'Портрет (PNG с прозрачным фоном)', en: 'Portrait (transparent PNG)' },
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'image/' } },
            },
            {
              name: 'portraitCaption',
              label: { ru: 'Подпись к портрету', en: 'Portrait caption' },
              type: 'text',
              localized: true,
            },
            {
              type: 'row',
              fields: [
                { name: 'index', label: { ru: 'Метка слева', en: 'Left label' }, type: 'text', localized: true },
                { name: 'edition', label: { ru: 'Метка по центру', en: 'Centre label' }, type: 'text', localized: true },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'city', label: { ru: 'Город (телефон)', en: 'City (mobile)' }, type: 'text', localized: true },
                { name: 'location', label: { ru: 'Город и формат (десктоп)', en: 'City & format (desktop)' }, type: 'text', localized: true },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'openToWork',
                  label: { ru: 'Показывать «Открыт к предложениям»', en: 'Show “Open to offers”' },
                  type: 'checkbox',
                  defaultValue: true,
                },
                { name: 'statusText', label: { ru: 'Текст статуса', en: 'Status text' }, type: 'text', localized: true },
              ],
            },
          ],
        },
        {
          label: { ru: 'Цифры', en: 'Numbers' },
          fields: [
            {
              name: 'facts',
              label: { ru: 'Факты на обложке', en: 'Cover facts' },
              type: 'array',
              maxRows: 4,
              labels: { singular: { ru: 'Факт', en: 'Fact' }, plural: { ru: 'Факты', en: 'Facts' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'value', label: { ru: 'Значение', en: 'Value' }, type: 'text', required: true, localized: true, admin: { width: '35%' } },
                    { name: 'label', label: { ru: 'Подпись', en: 'Label' }, type: 'text', required: true, localized: true, admin: { width: '65%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: { ru: 'Подход', en: 'Approach' },
          fields: [
            {
              name: 'principles',
              label: { ru: 'Принципы (лучше ровно четыре — это же ZeroFour)', en: 'Principles (four works best)' },
              type: 'array',
              maxRows: 6,
              labels: { singular: { ru: 'Принцип', en: 'Principle' }, plural: { ru: 'Принципы', en: 'Principles' } },
              fields: [
                { name: 'title', label: { ru: 'Заголовок', en: 'Title' }, type: 'text', required: true, localized: true },
                { name: 'text', label: { ru: 'Текст', en: 'Text' }, type: 'textarea', required: true, localized: true, maxLength: 240 },
                { name: 'proof', label: { ru: 'Доказательство (цифра, технология)', en: 'Proof (number, tech)' }, type: 'text', localized: true },
              ],
            },
          ],
        },
        {
          label: { ru: 'Обо мне', en: 'About me' },
          fields: [{
            name: 'profile', type: 'group', label: { ru: 'Профиль', en: 'Profile' },
            fields: [
              { name: 'title', type: 'text', localized: true, label: { ru: 'Заголовок', en: 'Title' } },
              { name: 'intro', type: 'textarea', localized: true, label: { ru: 'Коротко обо мне', en: 'Introduction' } },
              { name: 'body', type: 'textarea', localized: true, label: { ru: 'Моя история', en: 'My story' } },
              { name: 'focus', type: 'textarea', localized: true, label: { ru: 'Какие задачи интересны', en: 'Work I enjoy' } },
              { name: 'team', type: 'textarea', localized: true, label: { ru: 'Следующая команда', en: 'Next team' } },
              {
                name: 'experience', type: 'array', localized: true, label: { ru: 'Опыт', en: 'Experience' },
                fields: [
                  { name: 'period', type: 'text', required: true, label: { ru: 'Период', en: 'Period' } },
                  { name: 'title', type: 'text', required: true, label: { ru: 'Команда и роль', en: 'Team and role' } },
                  { name: 'text', type: 'textarea', label: { ru: 'Чем занимался', en: 'Responsibilities' } },
                ],
              },
            ],
          }],
        },
        {
          label: { ru: 'Контакты', en: 'Contacts' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'telegram', label: { ru: 'Telegram (без @)', en: 'Telegram (no @)' }, type: 'text' },
                { name: 'email', label: 'Email', type: 'email' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'github', label: 'GitHub URL', type: 'text' },
                { name: 'linkedin', label: 'LinkedIn URL', type: 'text' },
                { name: 'hh', label: 'hh.ru URL', type: 'text' },
              ],
            },
            {
              name: 'resume',
              label: { ru: 'Резюме (PDF)', en: 'Résumé (PDF)' },
              type: 'upload',
              relationTo: 'media',
              localized: true,
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'seoTitle', label: { ru: 'Заголовок вкладки', en: 'Page title' }, type: 'text', localized: true },
            {
              name: 'seoDescription',
              label: { ru: 'Описание для поиска', en: 'Search description' },
              type: 'textarea',
              localized: true,
              maxLength: 170,
            },
            { name: 'ogImage', label: { ru: 'Картинка для соцсетей', en: 'Social image' }, type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
};

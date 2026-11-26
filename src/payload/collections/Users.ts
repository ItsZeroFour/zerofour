import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: { ru: 'Администратор', en: 'Admin' }, plural: { ru: 'Администраторы', en: 'Admins' } },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  admin: {
    useAsTitle: 'email',
    group: { ru: 'Система', en: 'System' },
  },
  access: {
    // Регистрация только из админки (первый пользователь создаётся на /admin)
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [],
};

import { revalidatePath } from 'next/cache';
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload';

/**
 * Сайт собирается статически. После правки в админке сбрасываем кэш страниц,
 * чтобы изменения появились сразу, без передеплоя.
 */
function revalidateAll() {
  try {
    revalidatePath('/(site)/[locale]', 'layout');
  } catch {
    // вне запроса Next (например, в скрипте seed) ревалидация не нужна
  }
}

export const revalidateSite: CollectionAfterChangeHook = ({ doc }) => {
  revalidateAll();
  return doc;
};

export const revalidateSiteOnDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateAll();
  return doc;
};

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc }) => {
  revalidateAll();
  return doc;
};

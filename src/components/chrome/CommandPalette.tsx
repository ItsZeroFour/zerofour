'use client';

import { Command } from 'cmdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import styles from './CommandPalette.module.css';

/**
 * Навигация через ⌘K / Ctrl+K. Кнопка «Меню» в шапке открывает её же —
 * на телефоне это обычное меню.
 */
type Props = { label: string; telegram?: string | null; email?: string | null; projectCount: number };

export function CommandPalette({ label, telegram, email, projectCount }: Props) {
  const t = useTranslations('palette');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.menuOpen = '';
    window.__lenis?.stop();
    return () => {
      delete document.documentElement.dataset.menuOpen;
      window.__lenis?.start();
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!open) returnFocus.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : trigger.current;
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open || !returnFocus.current) return;
    let disposed = false;
    let frame = 0;
    const animations = document.querySelector('[cmdk-dialog]')?.getAnimations() ?? [];
    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (disposed) return;
      frame = requestAnimationFrame(() => {
        (returnFocus.current?.isConnected ? returnFocus.current : trigger.current)?.focus({ preventScroll: true });
      });
    });
    return () => { disposed = true; cancelAnimationFrame(frame); };
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const run = useCallback((fn: () => void) => {
    // Restart before navigation; Lenis otherwise ignores the selected scroll target.
    window.__lenis?.start();
    setOpen(false);
    fn();
  }, []);

  const goTo = (hash: string) => () => {
    if (pathname !== '/') {
      router.push(`/${hash}`);
      return;
    }
    const el = hash === '#top' ? document.body : document.querySelector<HTMLElement>(hash);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(hash === '#top' ? 0 : el, { duration: 1.6 });
    else el.scrollIntoView({ block: 'start' });
  };

  const other = locale === 'ru' ? 'en' : 'ru';

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(event) => { returnFocus.current = event.currentTarget; setOpen(true); }}
      >
        <span>{label}</span>
        <kbd className={styles.kbd}>⌘K</kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label={t('title')}
        loop
        filter={(value, search, keywords) =>
          [value, ...(keywords ?? [])].join(' ').toLowerCase().includes(search.trim().toLowerCase()) ? 1 : 0
        }
        overlayClassName={styles.overlay}
        contentClassName={styles.content}
        className={styles.cmd}
      >
        <Command.Input className={styles.input} placeholder={t('placeholder')} />
        <Command.List className={styles.list} data-lenis-prevent>
          <Command.Empty className={styles.empty}>{t('empty')}</Command.Empty>

          <Command.Group heading={t('groupNav')} className={styles.group}>
            <Command.Item className={styles.item} keywords={['work', 'работы', 'проекты', 'portfolio']} onSelect={() => run(goTo('#work'))}>
              <span className={styles.index}>01</span>
              {t('work')}
              <span className={styles.meta}>{String(projectCount).padStart(2, '0')}</span>
            </Command.Item>
            <Command.Item className={styles.item} keywords={['about', 'обо мне', 'approach', 'подход', 'how']} onSelect={() => run(goTo('#about'))}>
              <span className={styles.index}>02</span>
              {t('about')}
            </Command.Item>
            <Command.Item className={styles.item} keywords={['skills', 'certificates', 'навыки', 'сертификаты']} onSelect={() => run(goTo('#skills'))}>
              <span className={styles.index}>03</span>
              {t('skills')}
            </Command.Item>
            <Command.Item className={styles.item} keywords={['contacts', 'контакты', 'hire', 'написать']} onSelect={() => run(goTo('#contacts'))}>
              <span className={styles.index}>04</span>
              {t('contacts')}
            </Command.Item>
            <Command.Item className={styles.item} keywords={['top', 'наверх', 'cover', 'обложка']} onSelect={() => run(goTo('#top'))}>
              <span className={styles.index}>00</span>
              {t('top')}
            </Command.Item>
          </Command.Group>

          <Command.Group heading={t('groupContact')} className={styles.group}>
            {telegram ? (
              <Command.Item
                className={styles.item}
                keywords={['telegram', 'tg', 'телеграм']}
                onSelect={() => run(() => window.open(`https://t.me/${telegram}`, '_blank', 'noopener'))}
              >
                <span className={styles.index}>TG</span>
                {t('telegram')}
                <span className={styles.meta}>@{telegram}</span>
              </Command.Item>
            ) : null}
            {email ? (
            <>
            <Command.Item
              className={styles.item}
              keywords={['email', 'mail', 'почта']}
              onSelect={() => run(() => (window.location.href = `mailto:${email}`))}
            >
              <span className={styles.index}>@</span>
              {t('email')}
              <span className={styles.meta}>{email}</span>
            </Command.Item>
            <Command.Item
              className={styles.item}
              keywords={['copy', 'копировать', 'email']}
              onSelect={() =>
                run(() => {
                  navigator.clipboard?.writeText(email).then(() => setToast(t('copied')));
                })
              }
            >
              <span className={styles.index}>⧉</span>
              {t('copyEmail')}
            </Command.Item>
            </>
            ) : null}
          </Command.Group>

          <Command.Group heading={t('groupSite')} className={styles.group}>
            <Command.Item
              className={styles.item}
              keywords={['language', 'язык', 'english', 'русский', other]}
              onSelect={() => run(() => router.replace(pathname, { locale: other }))}
            >
              <span className={styles.index}>{other.toUpperCase()}</span>
              {t('lang')}
            </Command.Item>
          </Command.Group>
        </Command.List>
        <p className={styles.hint} aria-hidden="true">
          {t('hint')}
        </p>
      </Command.Dialog>

      <p className={styles.toast} role="status" aria-live="polite" data-show={toast ? 'true' : undefined}>
        {toast}
      </p>
    </>
  );
}

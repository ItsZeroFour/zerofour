import { MARK_BAR, MARK_PATH } from './mark-path';
import styles from './Mark.module.css';

type Props = {
  /** Перекладина «4» акцентным цветом */
  accent?: boolean;
  /** Подпись для скринридеров; без неё знак декоративный */
  title?: string;
  className?: string;
};

export function Mark({ accent = false, title, className }: Props) {
  return (
    <svg
      viewBox="0 0 116 100"
      className={[styles.mark, className].filter(Boolean).join(' ')}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d={MARK_PATH} />
      {accent ? <path className={styles.bar} d={MARK_BAR} /> : null}
    </svg>
  );
}

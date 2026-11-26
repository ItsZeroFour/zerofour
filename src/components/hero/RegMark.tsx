import styles from './RegMark.module.css';

type Corner = 'tl' | 'tr' | 'bl' | 'br';

/** Крестик-регистр печатника, ставится в угол рамки. */
export function RegMark({ corner }: { corner: Corner }) {
  return (
    <svg viewBox="0 0 14 14" className={`${styles.reg} ${styles[corner]}`} aria-hidden="true">
      <path d="M7 0v14M0 7h14" />
      <circle cx="7" cy="7" r="3.5" />
    </svg>
  );
}

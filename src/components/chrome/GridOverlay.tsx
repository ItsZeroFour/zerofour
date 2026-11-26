import styles from './GridOverlay.module.css';

/** Видимая модульная сетка: тонкие линии колонок поверх бумаги, под контентом. */
export function GridOverlay() {
  return (
    <div className={styles.grid} aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className={styles.col} />
      ))}
    </div>
  );
}

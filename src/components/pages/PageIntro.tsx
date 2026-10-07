import type { ReactNode } from 'react';
import styles from './PageIntro.module.css';

export function PageIntro({
  title,
  children,
  back,
}: {
  title: string;
  children?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className={styles.intro}>
      <a className={styles.back} href={back?.href ?? '/'}>
        ← {back?.label ?? 'Startsida'}
      </a>
      <p className="eyebrow">BF Rörsjöhus · Rörsjöstaden</p>
      <h1>{title}</h1>
      {children ? <div className={styles.description}>{children}</div> : null}
    </div>
  );
}

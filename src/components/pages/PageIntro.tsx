import type { ReactNode } from 'react';

/** Heading block shared by the inner pages. */
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
    <div
      className="reading"
      style={{ paddingTop: 'var(--space-6)', marginBottom: 'var(--space-4)' }}
    >
      {back ? (
        <p style={{ marginBottom: 'var(--space-1)' }}>
          <a href={back.href}>← {back.label}</a>
        </p>
      ) : null}
      <h1>{title}</h1>
      {children}
    </div>
  );
}

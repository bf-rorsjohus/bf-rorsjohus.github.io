import type { DrivePage } from '../../lib/drive-index';
import { PageIntro } from './PageIntro';

export function GuideIndexPage({ pages }: { pages: DrivePage[] }) {
  return (
    <div className="container">
      <PageIntro title="Bra att veta" />
      <ul className="reading" style={{ listStyle: 'none', padding: 0 }}>
        {pages.map((page) => (
          <li key={page.slug} style={{ marginBottom: 'var(--space-3)' }}>
            <a
              href={`/bra-att-veta/${page.slug}/`}
              style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}
            >
              {page.title}
            </a>
            {page.summary ? (
              <p style={{ color: 'var(--color-muted)', margin: 0 }}>{page.summary}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { DrivePage } from '../../lib/drive-index';
import { PageIntro } from './PageIntro';
import styles from './GuideIndexPage.module.css';

export function GuideIndexPage({ pages }: { pages: DrivePage[] }) {
  return (
    <div className="container">
      <PageIntro title="Bra att veta">
        <p>Om vardagen i huset och det vi har gemensamt.</p>
      </PageIntro>
      {pages.length ? (
        <ul className={styles.list}>
          {pages.map((page, index) => (
            <li key={page.slug}>
              <a href={`/bra-att-veta/${page.slug}/`} className={styles.link}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2>{page.title}</h2>
                  {page.summary ? <p>{page.summary}</p> : null}
                </div>
                <span className={styles.arrow} aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>Det finns ingen information här just nu.</p>
      )}
    </div>
  );
}

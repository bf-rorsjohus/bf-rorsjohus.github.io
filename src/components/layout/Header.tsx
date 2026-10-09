import { association } from '../../data/association';
import { Monogram } from '../ui/Monogram';
import styles from './Header.module.css';

const NAV = [
  { href: '/', label: 'Hem' },
  { href: '/bra-att-veta/', label: 'Bra att veta' },
  { href: '/dokument/', label: 'Dokument' },
  { href: '/bilder/', label: 'Bilder' },
];

interface Props {
  currentPath: string;
  guides: { title: string; slug: string }[];
}

export function Header({ currentPath, guides }: Props) {
  return (
    <header className={styles.header}>
      <a className={styles.skip} href="#main">
        Hoppa till innehållet
      </a>
      <div className={`container ${styles.inner}`}>
        <a className={styles.brand} href="/" aria-label="BF Rörsjöhus – startsida">
          <Monogram className={styles.mark} />
          <span>
            BF Rörsjöhus<span className={styles.subtitle}>Rörsjöstaden · Malmö</span>
          </span>
        </a>
        <nav aria-label="Huvudmeny">
          <ul className={styles.nav}>
            {NAV.map((item) => (
              <li
                key={item.href}
                className={
                  item.href === '/bra-att-veta/' && guides.length > 0 ? styles.hasMenu : undefined
                }
              >
                <a
                  href={item.href}
                  aria-current={
                    (item.href === '/' ? currentPath === '/' : currentPath.startsWith(item.href))
                      ? 'page'
                      : undefined
                  }
                >
                  {item.label}
                </a>
                {item.href === '/bra-att-veta/' && guides.length > 0 && (
                  <ul className={styles.menu}>
                    {guides.map((guide) => (
                      <li key={guide.slug}>
                        <a
                          href={`/bra-att-veta/${guide.slug}/`}
                          aria-current={
                            currentPath === `/bra-att-veta/${guide.slug}/` ? 'page' : undefined
                          }
                        >
                          {guide.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className={styles.portal}>
              <a href={association.memberPortal.href}>
                {association.memberPortal.label}
                <span className={styles.hint}>SBC</span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

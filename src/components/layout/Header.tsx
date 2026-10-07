import { association } from '../../data/association';
import styles from './Header.module.css';

const NAV = [
  { href: '/dokument/', label: 'Dokument' },
  { href: '/bilder/', label: 'Bilder' },
  { href: '/bra-att-veta/', label: 'Bra att veta' },
];

export function Header({ currentPath }: { currentPath: string }) {
  return (
    <header className={styles.header}>
      <a className={styles.skip} href="#main">
        Hoppa till innehållet
      </a>
      <div className={`container ${styles.inner}`}>
        <a
          className={styles.brand}
          href="/"
          aria-current={currentPath === '/' ? 'page' : undefined}
        >
          BF Rörsjöhus
        </a>
        <nav aria-label="Huvudmeny">
          <ul className={styles.nav}>
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={currentPath.startsWith(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href={association.memberPortal.href} className={styles.external}>
                {association.memberPortal.label}
                <span className={styles.hint}>(SBC)</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

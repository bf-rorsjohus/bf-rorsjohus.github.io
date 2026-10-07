import { association } from '../../data/association';
import { Monogram } from '../ui/Monogram';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.identity}>
          <Monogram />
          <div className={styles.name}>
            BF Rörsjöhus<p>Ett hem i Rörsjöstaden sedan {association.yearBuilt}.</p>
          </div>
        </div>
        <address className={styles.address}>
          <span className="eyebrow">Här finns vi</span>
          {association.street}
          <br />
          {association.postalCode} {association.city}
        </address>
        <div className={styles.contact}>
          <span className="eyebrow">Kontakta föreningen</span>
          <a href={`mailto:${association.email}`}>
            {association.email} <span aria-hidden="true">↗</span>
          </a>
          <a href={association.memberPortal.href}>
            Logga in hos SBC <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className={styles.bottom}>
          <span>
            {association.name} · Org.nr {association.orgNumber}
          </span>
          <span>
            {association.property} · {association.district}, {association.city}
          </span>
        </div>
      </div>
    </footer>
  );
}

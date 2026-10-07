import { association } from '../../data/association';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <address className={styles.address}>
          <strong>{association.name}</strong>
          <br />
          Org.nr {association.orgNumber}
          <br />
          {association.street}, {association.postalCode} {association.city}
          <br />
          <a href={`mailto:${association.email}`}>{association.email}</a>
        </address>
        <nav aria-label="Sidfot">
          <ul className={styles.links}>
            <li>
              <a href="/">Start</a>
            </li>
            <li>
              <a href="/dokument/">Dokument</a>
            </li>
            <li>
              <a href="/bilder/">Bilder</a>
            </li>
            <li>
              <a href="/bra-att-veta/">Bra att veta</a>
            </li>
          </ul>
        </nav>
        <p className={styles.privacy}>
          Webbplatsen använder inga kakor och ingen spårning. Den drivs på GitHub Pages, som loggar
          tekniska uppgifter som IP-adresser av säkerhetsskäl. Frågor om personuppgifter skickas
          till <a href={`mailto:${association.email}`}>{association.email}</a>.
        </p>
      </div>
    </footer>
  );
}

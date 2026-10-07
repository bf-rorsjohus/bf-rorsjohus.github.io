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
      </div>
    </footer>
  );
}

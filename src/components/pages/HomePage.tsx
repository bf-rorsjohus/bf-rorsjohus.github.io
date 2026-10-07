import { association } from '../../data/association';
import type { DrivePage } from '../../lib/drive-index';
import type { ResponsiveImage } from '../../lib/images';
import { ResponsiveImg } from '../ui/ResponsiveImg';
import { RichText } from '../ui/RichText';
import styles from './HomePage.module.css';

export function HomePage({
  welcomeHtml,
  startImage,
  pages,
  documentCount,
}: {
  welcomeHtml: string;
  startImage: ResponsiveImage | null;
  pages: DrivePage[];
  documentCount: number;
}) {
  return (
    <div className="container">
      <section className={styles.hero}>
        <div className={styles.intro}>
          <h1>Välkommen till {association.name}</h1>
          <p className={styles.address}>
            {association.street}, {association.district}, {association.city}
          </p>
          <RichText html={welcomeHtml} />
        </div>
        {startImage ? <ResponsiveImg image={startImage} className={styles.image} eager /> : null}
      </section>

      <section aria-labelledby="mer" className={styles.more}>
        <h2 id="mer">Hitta mer</h2>
        <ul className={styles.links}>
          <li>
            <a href="/dokument/">Dokument</a>
            <span>
              {documentCount} dokument, bland annat årsredovisningar, stadgar och energideklaration.
            </span>
          </li>
          <li>
            <a href="/bilder/">Bilder</a>
            <span>Bilder på fastigheten och innergården.</span>
          </li>
          <li>
            <a href="/bra-att-veta/">Bra att veta</a>
            <span>{pages.map((p) => p.title).join(', ')}.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

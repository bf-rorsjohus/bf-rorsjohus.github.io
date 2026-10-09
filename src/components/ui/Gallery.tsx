import type { ResponsiveImage } from '../../lib/images';
import { ResponsiveImg } from './ResponsiveImg';
import styles from './Gallery.module.css';

export function Gallery({ images }: { images: ResponsiveImage[] }) {
  if (images.length === 0) return <p>Det finns inga bilder just nu.</p>;
  return (
    <ul className={styles.grid}>
      {images.map((image) => (
        <li key={image.src}>
          <figure className={styles.figure}>
            <a
              href={image.fullSrc}
              className={styles.link}
              data-viewer
              data-gallery="bilder"
              data-title={image.alt}
            >
              <ResponsiveImg image={image} className={styles.image} />
              <span className="visually-hidden"> (öppna bilden i full storlek)</span>
            </a>
            <figcaption className={styles.caption}>{image.alt}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

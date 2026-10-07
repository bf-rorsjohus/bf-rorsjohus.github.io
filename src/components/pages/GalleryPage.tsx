import type { ResponsiveImage } from '../../lib/images';
import { Gallery } from '../ui/Gallery';
import { PageIntro } from './PageIntro';

export function GalleryPage({ images }: { images: ResponsiveImage[] }) {
  return (
    <div className="container">
      <PageIntro title="Bilder">
        <p>
          En närmare titt på huset och innergården. Öppna en bild för att se den i större format.
        </p>
      </PageIntro>
      <Gallery images={images} />
    </div>
  );
}

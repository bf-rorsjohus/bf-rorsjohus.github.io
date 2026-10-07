import type { ResponsiveImage } from '../../lib/images';
import { Gallery } from '../ui/Gallery';
import { PageIntro } from './PageIntro';

export function GalleryPage({ images }: { images: ResponsiveImage[] }) {
  return (
    <div className="container">
      <PageIntro title="Bilder" />
      <Gallery images={images} />
    </div>
  );
}

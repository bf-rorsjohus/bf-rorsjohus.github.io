import type { ResponsiveImage } from '../../lib/images';

export function ResponsiveImg({
  image,
  className,
  eager = false,
}: {
  image: ResponsiveImage;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      className={className}
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
    />
  );
}

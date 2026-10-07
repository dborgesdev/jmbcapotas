import { type Media } from "../../lib/wordpress/types";
export function Picture({
  image,
  alt,
  className = "",
  eager = false,
}: {
  image?: Media;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return image ? (
    <img
      src={image.url}
      srcSet={image.srcSet || undefined}
      sizes="(max-width: 768px) 100vw, 80vw"
      width={image.width}
      height={image.height}
      alt={image.alt || alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className={className}
    />
  ) : null;
}

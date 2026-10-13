import { Picture } from "../common/Picture";
import type { Term } from "../../lib/wordpress/types";
import { brandUrl } from "../../lib/paths";

export function BrandLogoGrid({
  brands,
  compact = false,
}: {
  brands: Term[];
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "mb-8 grid grid-cols-3 gap-2 border-y border-neutral-200 py-4 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9"
          : "my-10 flex flex-wrap gap-3 border-y border-neutral-200 py-8"
      }
    >
      {brands.map((b) => (
        <a
          key={b.id}
          href={brandUrl(b)}
          title={compact ? b.name : undefined}
          className={
            compact
              ? "group flex min-h-20 min-w-0 items-center justify-center p-3 transition-colors hover:bg-neutral-100"
              : "group flex min-h-32 min-w-44 flex-col items-center justify-center gap-3 px-10 transition-colors hover:bg-neutral-100"
          }
        >
          {b.image && (
            <Picture
              image={b.image}
              alt={b.name}
              className={
                compact
                  ? "h-12 w-20 max-w-full object-contain"
                  : "h-16 w-24 object-contain"
              }
            />
          )}
          {(!compact || !b.image) && (
            <span
              className={
                compact
                  ? "text-center text-xs font-bold break-words"
                  : "text-xs font-bold tracking-widest"
              }
            >
              {b.name}
              {!compact && " ↗"}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}

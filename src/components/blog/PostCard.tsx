import { headingText } from "../../lib/text";
import { Picture } from "../common/Picture";
import { type Post } from "../../lib/wordpress/types";
export function PostCard({ post: p }: { post: Post }) {
  return (
    <a href={p.url} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <Picture
          image={p.images[0]}
          alt={p.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        />
        {p.acf?.pronta_entrega && (
          <span className="absolute bottom-4 left-4 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider">
            Pronta entrega
          </span>
        )}
      </div>
      <div className="flex justify-between gap-4 pt-5">
        <h3 className="text-lg font-bold leading-snug">
          {headingText(p.name)}
        </h3>
        <span aria-hidden="true">↗</span>
      </div>
      {p.acf?.codigo_produto && (
        <p className="mt-2 text-xs text-neutral-500">
          Código {p.acf.codigo_produto}
        </p>
      )}
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
        {p.summary}
      </p>
    </a>
  );
}

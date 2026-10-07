import { useState } from "react";
import { Picture } from "../common/Picture";
import { type Post } from "../../lib/wordpress/types";
export function ProductGallery({ post }: { post: Post }) {
  const [active, setActive] = useState(0);
  return post.images.length ? (
    <div>
      <Picture
        image={post.images[active]}
        alt={post.name}
        eager
        className="aspect-[4/3] w-full bg-neutral-100 object-contain"
      />
      {post.images.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {post.images.map((m, i) => (
            <button
              aria-label={`Ver imagem ${i + 1} de ${post.name}`}
              aria-pressed={active === i}
              className={`w-24 border-2 ${active === i ? "border-red-600" : "border-transparent"}`}
              onClick={() => setActive(i)}
              key={m.id}
            >
              <Picture
                image={m}
                alt=""
                className="aspect-square object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  ) : (
    <p className="border-y border-neutral-200 py-10 text-neutral-500">
      Imagens deste produto ainda não disponíveis.
    </p>
  );
}

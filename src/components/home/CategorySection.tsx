import { Picture } from "../common/Picture";
import { type Post, type Term } from "../../lib/wordpress/types";
export function CategorySection({
  categories,
  product,
}: {
  categories: Term[];
  product?: Post;
}) {
  return (
    <section className="bg-[#171a1d] text-white">
      <div className="wrap py-16 md:py-24">
        <p className="eyebrow text-red-400">02 / Linhas e possibilidades</p>
        <h2 className="section-title mb-12 mt-4 max-w-2xl">
          Sua rotina pede.
          <br />
          Sua picape leva.
        </h2>
        {categories
          .filter((c) => !c.parent)
          .map((c, i) => (
            <a
              href={`/produtos/${c.slug}/`}
              key={c.id}
              className="group grid items-center gap-8 border-t border-white/20 py-10 md:grid-cols-[.8fr_1.2fr]"
            >
              <div>
                <span className="eyebrow text-neutral-500">
                  {String(i + 1).padStart(2, "0")} / Linha JMB
                </span>
                <h3 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                  {c.name}
                </h3>
                {c.description && (
                  <p className="mt-6 max-w-md text-sm leading-7 text-neutral-400">
                    {c.description}
                  </p>
                )}
                <span className="mt-8 inline-flex gap-14 border-b border-white/40 pb-3 text-sm">
                  Explore a linha <span>↗</span>
                </span>
              </div>
              <div className="overflow-hidden">
                {(c.background ||
                  c.image ||
                  (product?.categoria_produto?.includes(c.id)
                    ? product.images[0]
                    : undefined)) && (
                  <Picture
                    image={c.background || c.image || product?.images[0]}
                    alt={c.name}
                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                )}
              </div>
            </a>
          ))}
      </div>
    </section>
  );
}

import { Picture } from "../common/Picture";
import { type Term } from "../../lib/wordpress/types";
import { brandUrl } from "../../lib/paths";
export function BrandSelector({
  brands,
  error,
}: {
  brands: Term[];
  error?: string;
}) {
  return (
    <section id="marcas" className="wrap py-16 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-red-600">01 / Encontre a sua</p>
          <h2 className="section-title mt-4">Qual é a sua picape?</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-neutral-500">
          Comece pela marca e encontre os produtos
          <br className="hidden md:block" /> para o seu modelo.
        </p>
      </div>
      {error && (
        <p role="status" className="mt-6">
          {error}
        </p>
      )}
      <div className="my-10 flex flex-wrap gap-3 border-y border-neutral-200 py-8">
        {brands.map((b) => (
          <a
            key={b.id}
            href={brandUrl(b)}
            className="group flex min-h-32 min-w-44 flex-col items-center justify-center gap-3 px-10 transition-colors hover:bg-neutral-100"
          >
            {b.image && (
              <Picture
                image={b.image}
                alt={b.name}
                className="h-16 w-24 object-contain"
              />
            )}
            <span className="text-xs font-bold tracking-widest">
              {b.name} ↗
            </span>
          </a>
        ))}
      </div>
      <a
        href="/produtos/"
        className="inline-flex gap-10 border-b-2 border-red-600 pb-3 text-sm font-bold"
      >
        Ver todos os produtos <span>↗</span>
      </a>
    </section>
  );
}

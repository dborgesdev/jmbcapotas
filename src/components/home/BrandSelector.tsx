import { Eyebrow } from "../common/Eyebrow";
import { BrandLogoGrid } from "../catalog/BrandLogoGrid";
import { type Term } from "../../lib/wordpress/types";
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
          <Eyebrow className="text-red-600">01 / Encontre a sua</Eyebrow>
          <h2 className="section-title mt-4">Qual é o seu veículo?</h2>
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
      <BrandLogoGrid brands={brands} />
      <a
        href="/produtos/"
        className="inline-flex gap-10 border-b-2 border-red-600 pb-3 text-sm font-bold"
      >
        Ver todos os produtos <span>↗</span>
      </a>
    </section>
  );
}

import { headingText } from "../../lib/text";
import { ProductAvailability } from "./ProductAvailability";
import { type SiteData } from "../../lib/site/types";
import { type Post } from "../../lib/wordpress/types";
import { brandUrl } from "../../lib/paths";
import { ProductActions } from "./ProductActions";
export function ProductInfo({ p, tax }: { p: Post; tax: SiteData["tax"] }) {
  const categories = tax.categories.filter((c) =>
    p.categoria_produto?.includes(c.id),
  );
  const brands = tax.brands.filter((c) => p.marca?.includes(c.id));
  const models = tax.models.filter((c) => p.modelo?.includes(c.id));
  return (
    <div>
      <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-widest text-red-600">
        {categories.map((c) => (
          <a key={c.id} href={`/produtos/${c.slug}/`}>
            {c.name}
          </a>
        ))}
      </div>
      <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight md:text-4xl">
        {headingText(p.name)}
      </h1>
      <p className="mt-5 text-sm leading-7 text-neutral-600">
        {p.introduction ||
          p.summary ||
          "Confira os detalhes e converse com a JMB para confirmar a compatibilidade com seu veículo."}
      </p>
      {p.acf?.codigo_produto && (
        <p className="mt-4 text-sm text-neutral-500">
          Código {p.acf.codigo_produto}
        </p>
      )}
      <div className="my-6 flex flex-wrap gap-3 text-sm">
        {brands.map((b) => (
          <a className="border-b" href={brandUrl(b)} key={b.id}>
            {b.name}
          </a>
        ))}
        {models.map((m) => (
          <span key={m.id}>{m.name}</span>
        ))}
      </div>
      {p.acf?.pronta_entrega === true && <ProductAvailability />}

      <ProductActions p={p} />
    </div>
  );
}

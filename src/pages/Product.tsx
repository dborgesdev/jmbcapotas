import { Breadcrumb } from "../components/common/Breadcrumb";
import { StructuredData } from "../components/common/StructuredData";
import { ProductGallery } from "../components/products/ProductGallery";
import { SITE } from "../lib/config";
import { type SiteData } from "../lib/site/types";
import { ProductInfo } from "../components/products/ProductInfo";
import { RelatedProducts } from "../components/products/RelatedProducts";
export function Product({ d }: { d: SiteData }) {
  const p = d.post!;
  return (
    <div className="wrap pb-20">
      <Breadcrumb
        title={p.name}
        parent={{ name: "Produtos", url: "/produtos/" }}
      />
      <div className="grid gap-10 py-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <ProductGallery post={p} />
        <ProductInfo p={p} tax={d.tax} />
      </div>
      <section className="border-t border-neutral-200 py-12">
        <h2 className="mb-8 text-2xl font-bold">Conheça os detalhes</h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
      </section>
      <RelatedProducts products={d.related} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          description: p.summary,
          image: p.images.map((m) => m.url),
          ...(p.acf?.codigo_produto ? { sku: p.acf.codigo_produto } : {}),
          url: `${SITE}${p.url}`,
        }}
      />
    </div>
  );
}

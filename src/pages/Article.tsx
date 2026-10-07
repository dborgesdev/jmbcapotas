import { Picture } from "../components/common/Picture";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { StructuredData } from "../components/common/StructuredData";
import { SITE } from "../lib/config";
import { whatsapp } from "../lib/whatsapp";
import { type SiteData } from "../lib/site/types";
import { EditorialHeader } from "../components/common/EditorialHeader";
import { WorkProducts } from "../components/works/WorkProducts";
export function Article({ d }: { d: SiteData }) {
  const p = d.post!;
  return (
    <article className="wrap pb-20">
      <Breadcrumb title={d.title} />
      <EditorialHeader
        title={d.title}
        eyebrow="Blog / Na estrada"
        date={p.date}
      />
      <Picture
        image={p.images[0]}
        alt={p.name}
        className="my-10 max-h-[640px] w-full object-cover"
      />
      <div
        className="prose mt-8"
        dangerouslySetInnerHTML={{ __html: p.html }}
      />
      <WorkProducts products={d.related} />
      <a href={whatsapp()} className="btn mt-10">
        Fale com a JMB ↗
      </a>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.name,
          datePublished: p.date,
          dateModified: p.modified,
          image: p.images.map((m) => m.url),
          mainEntityOfPage: `${SITE}${p.url}`,
        }}
      />
    </article>
  );
}

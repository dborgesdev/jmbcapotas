import { Picture } from "../components/common/Picture";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { whatsapp } from "../lib/whatsapp";
import { type SiteData } from "../lib/site/types";
import { EditorialHeader } from "../components/common/EditorialHeader";
import { WorkProducts } from "../components/works/WorkProducts";
export function City({ d }: { d: SiteData }) {
  const p = d.post!;
  return (
    <article className="wrap pb-20">
      <Breadcrumb title={d.title} />
      <EditorialHeader title={d.title} eyebrow="JMB Capotas" />
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
    </article>
  );
}

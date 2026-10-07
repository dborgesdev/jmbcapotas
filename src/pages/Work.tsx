import { Breadcrumb } from "../components/common/Breadcrumb";
import { whatsapp } from "../lib/whatsapp";
import { type SiteData } from "../lib/site/types";
import { EditorialHeader } from "../components/common/EditorialHeader";
import { WorkGallery } from "../components/works/WorkGallery";
import { WorkProducts } from "../components/works/WorkProducts";
export function Work({ d }: { d: SiteData }) {
  const p = d.post!;
  return (
    <article className="wrap pb-20">
      <Breadcrumb title={d.title} />
      <EditorialHeader title={d.title} eyebrow="Trabalhos / Galeria" />
      <WorkGallery post={p} />
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

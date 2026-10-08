import { WhatsAppLink } from "../components/common/WhatsAppLink";
import { useWhatsApp } from "../lib/site/config-context";
import { introduction } from "../lib/site/introduction";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { type SiteData } from "../lib/site/types";
import { EditorialHeader } from "../components/common/EditorialHeader";
import { WorkGallery } from "../components/works/WorkGallery";
import { WorkProducts } from "../components/works/WorkProducts";
export function Work({ d }: { d: SiteData }) {
  const whatsapp = useWhatsApp();
  const p = d.post!;
  return (
    <article className="wrap pb-20">
      <Breadcrumb title={d.title} />
      <EditorialHeader
        introduction={introduction(d)}
        title={d.title}
        eyebrow="Trabalhos / Galeria"
      />
      <WorkGallery post={p} />
      <div
        className="prose mt-8"
        dangerouslySetInnerHTML={{ __html: p.html }}
      />
      <WorkProducts products={d.related} />
      <WhatsAppLink href={whatsapp()} className="btn mt-10">
        Fale com a JMB ↗
      </WhatsAppLink>
    </article>
  );
}

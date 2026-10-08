import { WhatsAppLink } from "../components/common/WhatsAppLink";
import { useWhatsApp } from "../lib/site/config-context";
import { introduction } from "../lib/site/introduction";
import { Picture } from "../components/common/Picture";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { type SiteData } from "../lib/site/types";
import { EditorialHeader } from "../components/common/EditorialHeader";
import { WorkProducts } from "../components/works/WorkProducts";
export function City({ d }: { d: SiteData }) {
  const whatsapp = useWhatsApp();
  const p = d.post!;
  return (
    <article className="wrap pb-20">
      <Breadcrumb title={d.title} />
      <EditorialHeader
        introduction={introduction(d)}
        title={d.title}
        eyebrow="JMB Capotas"
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
      <WhatsAppLink href={whatsapp()} className="btn mt-10">
        Fale com a JMB ↗
      </WhatsAppLink>
    </article>
  );
}

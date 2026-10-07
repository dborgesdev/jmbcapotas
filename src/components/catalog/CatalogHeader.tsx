import { headingText } from "../../lib/text";
import { Eyebrow } from "../common/Eyebrow";
import { introduction } from "../../lib/site/introduction";
import { Breadcrumb } from "../common/Breadcrumb";
import { type SiteData } from "../../lib/site/types";
export function CatalogHeader({ d }: { d: SiteData }) {
  return (
    <>
      <Breadcrumb
        title={d.title}
        parent={{ name: "Produtos", url: "/produtos/" }}
      />
      <Eyebrow className="text-red-600">
        Catálogo JMB / Encontre sua solução
      </Eyebrow>
      <h1 className="section-title mt-5 max-w-3xl">{headingText(d.title)}</h1>
      <p className="mt-6 max-w-3xl whitespace-pre-line text-base leading-7 text-neutral-600">
        {introduction(d)}
      </p>
    </>
  );
}

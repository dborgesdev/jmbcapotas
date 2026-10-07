import { Breadcrumb } from "../common/Breadcrumb";
import { type SiteData } from "../../lib/site/types";
export function CatalogHeader({ d }: { d: SiteData }) {
  return (
    <>
      <Breadcrumb
        title={d.title}
        parent={{ name: "Produtos", url: "/produtos/" }}
      />
      <p className="eyebrow text-red-600">
        Catálogo JMB / Encontre sua solução
      </p>
      <h1 className="section-title mt-5 max-w-3xl">{d.title}</h1>
    </>
  );
}

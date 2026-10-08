import type { SiteData } from "../../lib/site/types";
import { CatalogHeader } from "./CatalogHeader";
import { Picture } from "../common/Picture";
import { Breadcrumb } from "../common/Breadcrumb";
import { Eyebrow } from "../common/Eyebrow";
import { headingText } from "../../lib/text";
import { introduction } from "../../lib/site/introduction";
export function BrandHero({ d }: { d: SiteData }) {
  const brand = d.tax.brands.find((b) => b.id === d.brandId);
  if (!brand?.background) return <CatalogHeader d={d} />;
  return (
    <>
      <div className="wrap">
        <Breadcrumb
          title={d.title}
          parent={{ name: "Produtos", url: "/produtos/" }}
        />
      </div>
      <header className="relative isolate overflow-hidden py-16 text-white md:py-24">
        <div className="absolute inset-0 -z-20 bg-[#171a1d]">
          <Picture
            image={brand.background}
            eager
            alt=""
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover object-center md:object-[center_45%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/45" />
        </div>
        <div className="wrap">
          <Eyebrow className="text-white/80">
            Catálogo JMB / Encontre sua solução
          </Eyebrow>
          <h1 className="section-title mt-5 max-w-3xl">
            {headingText(d.title)}
          </h1>
          <p className="mt-6 max-w-3xl whitespace-pre-line text-base leading-7 text-white/90">
            {introduction(d)}
          </p>
        </div>
      </header>
    </>
  );
}

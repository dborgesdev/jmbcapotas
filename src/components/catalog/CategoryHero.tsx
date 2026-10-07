import type { SiteData } from "../../lib/site/types";
import { introduction } from "../../lib/site/introduction";
import { headingText } from "../../lib/text";
import { Picture } from "../common/Picture";
import { Breadcrumb } from "../common/Breadcrumb";
import { Eyebrow } from "../common/Eyebrow";
export function CategoryHero({ d }: { d: SiteData }) {
  const category = d.tax.categories.find((c) => c.id === d.categoryId);
  return (
    <>
      <Breadcrumb
        title={d.title}
        parent={{ name: "Produtos", url: "/produtos/" }}
      />
      <header className="relative isolate overflow-hidden bg-[#171a1d] px-6 py-20 text-white md:px-12 md:py-28">
        <Picture
          image={category?.background}
          eager
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-black/65" />
        <Eyebrow className="text-white/80">Catálogo JMB</Eyebrow>
        <h1 className="section-title mt-5">{headingText(d.title)}</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/85">
          {introduction(d)}
        </p>
      </header>
    </>
  );
}

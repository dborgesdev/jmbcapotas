import { type SiteData } from "../lib/site/types";
import { ModelSelector } from "../components/catalog/ModelSelector";
import { CatalogLayout } from "../components/catalog/CatalogLayout";
import { BrandHero } from "../components/catalog/BrandHero";
export function Brand({ d }: { d: SiteData }) {
  const hasBackground = !!d.tax.brands.find((b) => b.id === d.brandId)
    ?.background;
  return (
    <CatalogLayout d={d} hero={hasBackground ? <BrandHero d={d} /> : undefined}>
      {!hasBackground && <BrandHero d={d} />}
      <ModelSelector d={d} />
    </CatalogLayout>
  );
}

import { type SiteData } from "../lib/site/types";
import { CatalogLayout } from "../components/catalog/CatalogLayout";
import { CatalogHeader } from "../components/catalog/CatalogHeader";
import { BrandSelector } from "../components/home/BrandSelector";
export function Catalog({ d }: { d: SiteData }) {
  return (
    <CatalogLayout d={d}>
      <CatalogHeader d={d} />
      <BrandSelector brands={d.tax.brands} catalog />
    </CatalogLayout>
  );
}

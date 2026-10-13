import { type SiteData } from "../lib/site/types";
import { CatalogLayout } from "../components/catalog/CatalogLayout";
import { CatalogHeader } from "../components/catalog/CatalogHeader";
import { BrandLogoGrid } from "../components/catalog/BrandLogoGrid";
export function Catalog({ d }: { d: SiteData }) {
  return (
    <CatalogLayout d={d}>
      <CatalogHeader d={d} />
      <BrandLogoGrid brands={d.tax.brands} compact />
    </CatalogLayout>
  );
}

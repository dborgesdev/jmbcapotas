import type { SiteData } from "../lib/site/types";
import { CatalogLayout } from "../components/catalog/CatalogLayout";
import { CatalogHeader } from "../components/catalog/CatalogHeader";

export function Category({ d }: { d: SiteData }) {
  return (
    <CatalogLayout d={d}>
      <CatalogHeader d={d} />
    </CatalogLayout>
  );
}

import type { SiteData } from "../lib/site/types";
import { CatalogLayout } from "../components/catalog/CatalogLayout";
import { CategoryHero } from "../components/catalog/CategoryHero";

export function Category({ d }: { d: SiteData }) {
  return (
    <CatalogLayout d={d}>
      <CategoryHero d={d} />
    </CatalogLayout>
  );
}

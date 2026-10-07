import { type SiteData } from "../lib/site/types";
import { ModelSelector } from "../components/catalog/ModelSelector";
import { CatalogLayout } from "../components/catalog/CatalogLayout";
import { CatalogHeader } from "../components/catalog/CatalogHeader";
export function Brand({ d }: { d: SiteData }) {
  return (
    <CatalogLayout d={d}>
      <CatalogHeader d={d} />
      <ModelSelector d={d} />
    </CatalogLayout>
  );
}

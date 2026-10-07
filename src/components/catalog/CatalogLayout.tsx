import { type ReactNode } from "react";
import { EmptyState } from "../common/EmptyState";
import { ProductGrid } from "../products/ProductGrid";
import { FinalCta } from "../home/FinalCta";
import { type SiteData } from "../../lib/site/types";
import { Pagination } from "./Pagination";
import { CatalogFilters } from "./CatalogFilters";
export function CatalogLayout({
  d,
  children,
}: {
  d: SiteData;
  children?: ReactNode;
}) {
  return (
    <>
      <div className="wrap pb-16">
        {children}
        <CatalogFilters d={d} />
        <div className="mb-8 flex justify-between text-xs text-neutral-500">
          <p>{d.list?.total || 0} produto(s) encontrado(s)</p>
          <a className="underline" href={d.path}>
            Limpar filtros
          </a>
        </div>
        {d.list?.items.length ? (
          <ProductGrid posts={d.list.items} />
        ) : (
          <EmptyState text="Nenhum produto encontrado para esta seleção." />
        )}
        <Pagination d={d} />
      </div>
      <FinalCta />
    </>
  );
}

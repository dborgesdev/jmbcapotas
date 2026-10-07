import { headingText } from "../lib/text";
import { introduction } from "../lib/site/introduction";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { EmptyState } from "../components/common/EmptyState";
import { type SiteData } from "../lib/site/types";
import { Pagination } from "../components/catalog/Pagination";
import { WorkGrid } from "../components/works/WorkGrid";
export function Works({ d }: { d: SiteData }) {
  return (
    <div className="wrap pb-20">
      <Breadcrumb title={d.title} />
      <h1 className="section-title py-8">{headingText(d.title)}</h1>
      <p className="mt-6 max-w-3xl text-base leading-7 text-neutral-600">
        {introduction(d)}
      </p>
      {d.list?.items.length ? (
        <WorkGrid posts={d.list.items} />
      ) : (
        <EmptyState text="Nenhum trabalho publicado ainda." />
      )}
      <Pagination d={d} />
    </div>
  );
}

import { headingText } from "../lib/text";
import { introduction } from "../lib/site/introduction";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { EmptyState } from "../components/common/EmptyState";
import { type SiteData } from "../lib/site/types";
import { Pagination } from "../components/catalog/Pagination";
import { PostGrid } from "../components/blog/PostGrid";
import { BlogFilters } from "../components/blog/BlogFilters";
export function Blog({ d }: { d: SiteData }) {
  return (
    <div className="wrap pb-20">
      <Breadcrumb title={d.title} />
      <h1 className="section-title py-8">{headingText(d.title)}</h1>
      <p className="mt-6 max-w-3xl text-base leading-7 text-neutral-600">
        {introduction(d)}
      </p>
      <BlogFilters d={d} />
      {d.list?.items.length ? (
        <PostGrid posts={d.list.items} />
      ) : (
        <EmptyState text="Em breve, novas histórias e dicas por aqui." />
      )}
      <Pagination d={d} />
    </div>
  );
}

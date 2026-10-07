import { Breadcrumb } from "../components/common/Breadcrumb";
import { EmptyState } from "../components/common/EmptyState";
import { type SiteData } from "../lib/site/types";
export function Cities({ d }: { d: SiteData }) {
  return (
    <div className="wrap pb-20">
      <Breadcrumb title={d.title} />
      <h1 className="section-title py-8">{d.title}</h1>
      {d.cities.length ? (
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {d.cities.map((c) => (
            <li key={c.id}>
              <a
                href={c.url}
                className="block border-y border-neutral-300 py-6 text-xl font-bold"
              >
                {c.name} {c.acf?.estado} ↗
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

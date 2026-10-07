import { type SiteData } from "../../lib/site/types";
export function Pagination({ d }: { d: SiteData }) {
  const page = d.search.pagina || 1;
  const href = (p: number) =>
    `${d.path}?${new URLSearchParams(
      Object.entries({ ...d.search, pagina: p })
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)]),
    )}`;
  return (d.list?.pages || 0) > 1 ? (
    <nav
      aria-label="Paginação"
      className="mt-14 flex items-center justify-center gap-6"
    >
      {page > 1 && (
        <a className="btn-outline" href={href(page - 1)}>
          ← Anterior
        </a>
      )}
      <span className="text-sm">
        {page} / {d.list?.pages}
      </span>
      {page < (d.list?.pages || 0) && (
        <a className="btn-outline" href={href(page + 1)}>
          Próxima →
        </a>
      )}
    </nav>
  ) : null;
}

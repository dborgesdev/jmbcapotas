import { type SiteData } from "../../lib/site/types";
export function BlogFilters({ d }: { d: SiteData }) {
  return (
    <form action={d.path} className="mb-10 flex flex-wrap gap-3">
      <label className="flex-1">
        {" "}
        <span className="sr-only">Buscar artigos</span>
        <input
          className="field"
          name="q"
          type="search"
          placeholder="Buscar no blog"
          defaultValue={d.search.q}
        />
      </label>
      <label>
        <span className="sr-only">Categoria do blog</span>
        <select
          className="field"
          name="blogCategoria"
          defaultValue={d.search.blogCategoria}
        >
          <option value="">Todas as categorias</option>
          {d.blogCategories?.map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <button className="btn">Buscar ↗</button>
    </form>
  );
}

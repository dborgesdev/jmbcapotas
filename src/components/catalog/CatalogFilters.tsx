import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { brandUrl } from "../../lib/paths";
import { brandSearch } from "../../lib/site/brand-search";
import { type SiteData } from "../../lib/site/types";
export function CatalogFilters({ d }: { d: SiteData }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(d.search.q || "");
  const [category, setCategory] = useState(
    String(d.categoryId || d.search.categoria || ""),
  );
  const [brand, setBrand] = useState(String(d.brandId || d.search.marca || ""));
  const [model, setModel] = useState(d.search.modelo || "");
  const models = d.tax.models.filter((m) => String(m.acf?.marca) === brand);
  return (
    <form
      action={d.path}
      method="get"
      className="my-10 grid items-end gap-4 border-y border-neutral-200 py-7 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
    >
      <label className="text-xs font-bold">
        Busca
        <input
          className="field mt-2"
          name="q"
          type="search"
          placeholder="O que seu veículo precisa?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <label className="text-xs font-bold">
        Categoria
        <select
          className="field mt-2"
          name="categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={!!d.categoryId}
        >
          <option value="">Todas as categorias</option>
          {d.tax.categories.map((c) => (
            <option value={c.id} key={c.id}>
              {c.parent ? "— " : ""}
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold">
        Marca
        <select
          className="field mt-2"
          name="marca"
          value={brand}
          onChange={(e) => {
            if (d.brandId) {
              const target = d.tax.brands.find(
                (b) => String(b.id) === e.target.value,
              );
              const search = brandSearch(
                { q: query, categoria: category, modelo: model },
                e.target.value,
                d.tax,
              );
              void navigate(
                target
                  ? {
                      to: "/$/",
                      params: { _splat: brandUrl(target).slice(1, -1) },
                      search,
                    }
                  : { to: "/$/", params: { _splat: "produtos" }, search },
              );
              return;
            }
            setBrand(e.target.value);
            setModel("");
          }}
        >
          <option value="">Todas as marcas</option>
          {d.tax.brands.map((b) => (
            <option value={b.id} key={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold">
        Modelo
        <select
          className="field mt-2"
          name="modelo"
          value={model}
          disabled={!brand}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="">
            {brand ? "Todos os modelos" : "Selecione a marca"}
          </option>
          {models.map((m) => (
            <option value={m.id} key={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <button className="btn">Buscar ↗</button>
    </form>
  );
}

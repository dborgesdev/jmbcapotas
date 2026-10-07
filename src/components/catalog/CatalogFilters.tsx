import { useState } from "react";
import { type SiteData } from "../../lib/site/types";
export function CatalogFilters({ d }: { d: SiteData }) {
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
          defaultValue={d.search.q}
        />
      </label>
      <label className="text-xs font-bold">
        Categoria
        <select
          className="field mt-2"
          name="categoria"
          defaultValue={d.categoryId || d.search.categoria || ""}
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
          disabled={!!d.brandId}
          onChange={(e) => {
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

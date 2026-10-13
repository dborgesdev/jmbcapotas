import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { categoryTree } from "../src/lib/categories";
import { catalogDestination } from "../src/lib/site/catalog-search";
import { CatalogFilters } from "../src/components/catalog/CatalogFilters";
import type { SiteData } from "../src/lib/site/types";
import type { Term } from "../src/lib/wordpress/types";
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => vi.fn() }));
const term = (id: number, name: string, parent = 0): Term => ({
  id,
  name,
  parent,
  slug: `categoria-${id}`,
  description: "",
  count: 0,
});
const categories = [
  term(4, "Tampão Marítimo em Fibra"),
  term(6, "Zíper", 2),
  term(2, "Fechadura", 1),
  term(5, "Capotas Marítimas em Lona"),
  term(3, "Capota de Fibra"),
  term(1, "Acessórios"),
  term(7, "Alça", 1),
];
const data: SiteData = {
  kind: "catalog",
  title: "Capota de Fibra",
  path: "/produtos/categoria-3/",
  categoryId: 3,
  search: { pagina: 4, categoria: "1" },
  pages: [],
  cities: [],
  tax: {
    categories,
    brands: [term(10, "Marca")],
    models: [{ ...term(11, "Modelo"), acf: { marca: 10 } }],
  },
};
describe("Categorias compartilhadas", () => {
  it("ordena principais e irmãos em pt-BR, filhos após o pai e todos os níveis vazios", () => {
    expect(
      categoryTree(categories).map(({ term, depth }) => [term.name, depth]),
    ).toEqual([
      ["Acessórios", 0],
      ["Alça", 1],
      ["Fechadura", 1],
      ["Zíper", 2],
      ["Capota de Fibra", 0],
      ["Capotas Marítimas em Lona", 0],
      ["Tampão Marítimo em Fibra", 0],
    ]);
    expect(categoryTree([...categories].reverse())).toEqual(
      categoryTree(categories),
    );
  });
  it("tolera ciclos e pais ausentes sem perder ou duplicar termos", () => {
    const result = categoryTree([
      term(1, "A", 2),
      term(2, "B", 1),
      term(3, "C", 99),
    ]);
    expect(new Set(result.map(({ term }) => term.id)).size).toBe(3);
  });
  it("filtro permite categoria diferente, respeita a rota direta e indica profundidade", () => {
    const html = renderToStaticMarkup(<CatalogFilters d={data} />);
    expect(html).toContain('value="3" selected=""');
    expect(html).not.toMatch(/name="categoria"[^>]*disabled/);
    expect(html.indexOf("Acessórios")).toBeLessThan(html.indexOf("Fechadura"));
    expect(html).toContain("— — Zíper");
  });
  it("troca para rota canônica da subcategoria e preserva busca/marca/modelo compatível, sem paginação", () => {
    expect(
      catalogDestination(data, {
        q: "capota",
        categoria: "2",
        marca: "10",
        modelo: "11",
        pagina: 4,
      }),
    ).toEqual({
      to: "/$/",
      params: { _splat: "produtos/categoria-2" },
      search: { q: "capota", categoria: undefined, marca: "10", modelo: "11" },
    });
  });
  it("Todas as categorias retorna ao catálogo; permanecer mantém a rota", () => {
    expect(catalogDestination(data, { categoria: "" }).params._splat).toBe(
      "produtos",
    );
    expect(catalogDestination(data, { categoria: "3" }).params._splat).toBe(
      "produtos/categoria-3",
    );
  });
  it("descarta modelo incompatível e filtros inválidos", () => {
    expect(
      catalogDestination(data, { categoria: "2", modelo: "11" }).search.modelo,
    ).toBeUndefined();
    expect(
      catalogDestination(data, { marca: "999", modelo: "11" }).search.marca,
    ).toBeUndefined();
  });
  it("catálogo, marca e pronta entrega conservam sua rota e usam categoria na query", () => {
    for (const path of [
      "/produtos/",
      "/marcas/capota-de-fibra-para-marca/",
      "/pronta-entrega/",
    ]) {
      const d = {
        ...data,
        path,
        categoryId: undefined,
        brandId: path.startsWith("/marcas/") ? 10 : undefined,
      };
      const target = catalogDestination(d, {
        q: "teste",
        categoria: "2",
        marca: "10",
        modelo: "11",
        pagina: 3,
      });
      expect(target.params._splat).toBe(path.slice(1, -1));
      expect(target.search).toMatchObject({
        categoria: "2",
        q: "teste",
        modelo: "11",
      });
      expect(target.search.pagina).toBeUndefined();
      expect(target.search.marca).toBe(d.brandId ? undefined : "10");
    }
  });
});

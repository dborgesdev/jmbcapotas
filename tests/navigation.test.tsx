import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { categoryNavigation, companyNavigation } from "../src/lib/navigation";
import { BrandSelector } from "../src/components/home/BrandSelector";
import type { Term } from "../src/lib/wordpress/types";

const term = (id: number, parent = 0, count = 1): Term => ({
  id,
  parent,
  count,
  name: `Categoria ${id}`,
  slug: `categoria-${id}`,
  description: "",
});
describe("Navegação comercial", () => {
  it("inclui mais de cinco categorias, ordena filhos e omite destinos vazios", () => {
    const items = categoryNavigation([
      term(2, 1),
      term(1),
      term(3, 0, 0),
      term(4),
      term(5),
      term(6),
      term(7),
      term(8),
    ]);
    expect(items).toHaveLength(8);
    expect(items[1]).toMatchObject({ url: "/produtos/categoria-2/", depth: 1 });
    expect(items.some((i) => i.url.includes("categoria-3"))).toBe(false);
    expect(items.at(-1)?.url).toBe("/produtos/");
  });
  it("tolera ciclos, pais ausentes e pais vazios com filhos publicados", () => {
    const items = categoryNavigation([
      term(1, 2),
      term(2, 1),
      term(3, 99),
      term(4, 0, 0),
      term(5, 4),
    ]);
    expect(new Set(items.map((i) => i.url)).size).toBe(5);
    expect(items.find((i) => i.url.includes("categoria-5"))?.depth).toBe(0);
  });
  it("Empresa usa URLs públicas das Pages e marcas sem logo mantêm link textual", () => {
    expect(companyNavigation.map((i) => i.url)).toEqual([
      "/quem-somos/",
      "/a-fabrica/",
    ]);
    const html = renderToStaticMarkup(
      <BrandSelector brands={[term(1)]} catalog />,
    );
    expect(html).toContain("/marcas/capota-de-fibra-para-categoria-1/");
    expect(html).toContain("Categoria 1");
    expect(html).not.toContain("Ver todos os produtos");
  });
});

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { categoryNavigation, companyNavigation } from "../src/lib/navigation";
import { BrandSelector } from "../src/components/home/BrandSelector";
import { BrandLogoGrid } from "../src/components/catalog/BrandLogoGrid";
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
  it("inclui mais de cinco categorias, ordena filhos e inclui categorias vazias", () => {
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
    expect(items).toHaveLength(9);
    expect(items[1]).toMatchObject({ url: "/produtos/categoria-2/", depth: 1 });
    expect(items.some((i) => i.url.includes("categoria-3"))).toBe(true);
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
    expect(new Set(items.map((i) => i.url)).size).toBe(6);
    expect(items.find((i) => i.url.includes("categoria-5"))?.depth).toBe(1);
  });
  it("Empresa usa URLs públicas das Pages e marcas sem logo mantêm link textual", () => {
    expect(companyNavigation.map((i) => i.url)).toEqual([
      "/quem-somos/",
      "/a-fabrica/",
    ]);
    const html = renderToStaticMarkup(
      <BrandLogoGrid brands={[term(1)]} compact />,
    );
    expect(html).toContain("/marcas/capota-de-fibra-para-categoria-1/");
    expect(html).toContain("Categoria 1");
    expect(html).not.toContain("Ver todos os produtos");
  });
  it("mantém a seção editorial na Home e somente logos acessíveis na grade compacta", () => {
    const brand = {
      ...term(1),
      image: {
        id: 1,
        url: "https://example.test/logo.webp",
        alt: "",
        width: 100,
        height: 100,
        srcSet: "",
      },
    };
    const home = renderToStaticMarkup(<BrandSelector brands={[brand]} />);
    expect(home).toContain("Qual é o seu veículo?");
    expect(home).toContain("Comece pela marca");
    expect(home).toContain("Ver todos os produtos");
    expect(home).toContain("Categoria 1 ↗");
    const compact = renderToStaticMarkup(
      <BrandLogoGrid brands={[brand]} compact />,
    );
    expect(compact).toContain('alt="Categoria 1"');
    expect(compact).toContain('title="Categoria 1"');
    expect(compact).not.toContain("<span");
    expect(compact).not.toContain("<h2");
    expect(compact).not.toContain("Comece pela marca");
  });
});

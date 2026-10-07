import { describe, it, expect } from "vitest";
import { clean, safeHtml } from "../src/lib/wordpress/html";
import { productUrl, fiberCategory } from "../src/lib/wordpress/product-urls";
import { cartMessage, buyMessage, whatsapp } from "../src/lib/whatsapp";
import { validateSearch } from "../src/lib/search";
describe("Filtros na URL", () => {
  it("preserva IDs numéricos interpretados pelo roteador", () => {
    expect(
      validateSearch({
        marca: 4,
        modelo: 5,
        categoria: "3",
        q: 123,
        pagina: 2,
      }),
    ).toEqual({
      marca: "4",
      modelo: "5",
      categoria: "3",
      q: "123",
      pagina: 2,
      blogCategoria: undefined,
    });
  });
  it("rejeita IDs e páginas inválidas", () => {
    const result = validateSearch({ marca: "NaN", modelo: -1, pagina: 2.5 });
    expect(result.marca).toBeUndefined();
    expect(result.modelo).toBeUndefined();
    expect(result.pagina).toBeUndefined();
  });
});
const categories = [
  {
    id: 3,
    name: "Capota de Fibra",
    slug: "capota-de-fibra",
    description: "",
    parent: 0,
    count: 1,
  },
  { id: 6, name: "Filha", slug: "filha", description: "", parent: 3, count: 1 },
];
describe("URLs e conteúdo WordPress", () => {
  it("usa a classificação e modelo para a URL histórica", () => {
    expect(
      productUrl(
        { slug: "teste", categoria_produto: [6], modelo: [5] },
        categories,
      ),
    ).toBe("/capota-para-picape/teste/");
    expect(
      productUrl(
        { slug: "capota-no-titulo", categoria_produto: [9], modelo: [5] },
        categories,
      ),
    ).toBe("/produtos/capota-no-titulo/");
    expect(
      productUrl({ slug: "generica", categoria_produto: [3] }, categories),
    ).toBe("/produtos/generica/");
  });
  it("tolera ciclos na hierarquia", () =>
    expect(
      fiberCategory(
        [10],
        [
          {
            id: 10,
            name: "x",
            slug: "x",
            description: "",
            parent: 10,
            count: 1,
          },
        ],
      ),
    ).toBe(false));
  it("remove conteúdo ativo e deriva resumo do editor", () => {
    expect(
      safeHtml(
        '<script>alert(1)</script><p onclick="x()">Texto</p><a href="javascript:x()">link</a>',
      ),
    ).not.toMatch(/script|onclick|javascript/);
    expect(clean("<p>Fibra &amp; proteção</p>")).toBe("Fibra & proteção");
  });
});
describe("Conversão WhatsApp", () => {
  it("inclui identificação e URL de produto", () => {
    const message = buyMessage({
      name: "Capota",
      url: "/produtos/capota/",
      acf: { codigo_produto: "CFF-01" },
    });
    expect(message).toContain("CFF-01");
    expect(message).toContain("https://jmbcapotas.com.br/produtos/capota/");
    expect(whatsapp(message)).toContain("https://wa.me/5541998686072?text=");
  });
  it("serializa quantidades de todos os itens", () => {
    expect(
      cartMessage([
        {
          productId: 1,
          slug: "a",
          name: "Capota",
          quantity: 2,
          codigo: "A1",
          publicUrl: "https://jmbcapotas.com.br/a/",
        },
      ]),
    ).toContain("2 × Capota (código A1)");
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const raw = {
  id: 21,
  slug: "teste",
  title: { rendered: "Teste" },
  content: { rendered: "<p>Texto.</p>" },
  featured_media: 0,
  date: "2026-10-07",
  modified: "2026-10-07",
  acf: {},
};
const fetchMock = vi.fn();
beforeEach(() => {
  vi.resetModules();
  fetchMock.mockReset().mockImplementation(async (url: string) => {
    const parsed = new URL(url);
    const endpoint = parsed.pathname.split("/").pop();
    const data =
      endpoint === "marca"
        ? [{ id: 3, slug: "fiat", name: "Fiat", description: "", count: 1 }]
        : endpoint === "modelo"
          ? [
              {
                id: 4,
                slug: "strada",
                name: "Strada",
                description: "",
                count: 1,
                acf: { marca: 3 },
              },
            ]
          : endpoint === "categoria_produto"
            ? [
                {
                  id: 2,
                  slug: "capota-de-fibra",
                  name: "Fibra",
                  description: "",
                  count: 1,
                },
              ]
            : endpoint === "produto"
              ? [
                  {
                    ...raw,
                    categoria_produto: [2],
                    modelo: [4],
                    marca: [3],
                    acf: { pronta_entrega: true },
                  },
                ]
              : endpoint === "cidade"
                ? [{ ...raw, acf: { estado: "PR" } }]
                : ["pages", "posts", "trabalho"].includes(endpoint || "")
                  ? [raw]
                  : [];
    return new Response(JSON.stringify(data), {
      headers: { "x-wp-total": String(data.length), "x-wp-totalpages": "1" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());
const resolve = async (path: string, search = {}) =>
  (await import("../src/lib/site/resolve-route")).resolveRoute({
    path,
    search,
  });

describe("Resolução SSR das URLs históricas", () => {
  it.each([
    ["/teste/", "page", "/teste/"],
    ["/blog/teste/", "article", "/blog/teste/"],
    ["/trabalhos/teste/", "work", "/trabalhos/teste/"],
    [
      "/venda-de-capota-para-picape-em-teste/",
      "city",
      "/venda-de-capota-para-picape-em-teste/",
    ],
    ["/capota-para-picape/teste/", "product", "/capota-para-picape/teste/"],
  ])("preserva %s", async (path, kind, canonical) => {
    const data = await resolve(path);
    expect(data.kind).toBe(kind);
    expect(data.post?.url).toBe(canonical);
  });
  it("prioriza categoria e preserva redirect 301 de produto", async () => {
    expect(await resolve("/produtos/capota-de-fibra/")).toMatchObject({
      kind: "catalog",
      categoryId: 2,
    });
    await expect(resolve("/produtos/teste/")).rejects.toMatchObject({
      status: 301,
      options: {
        statusCode: 301,
        params: { _splat: "capota-para-picape/teste" },
      },
    });
  });
  it("mantém filtros REST dependentes e paginação server-side", async () => {
    await resolve("/produtos/", {
      marca: "3",
      modelo: "4",
      categoria: "2",
      q: "fibra",
    });
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toContainEqual(
      expect.stringContaining(
        "produto?per_page=12&search=fibra&page=1&marca=3&modelo=4&categoria_produto=2",
      ),
    );
    await expect(resolve("/produtos/", { pagina: 999 })).rejects.toMatchObject({
      isNotFound: true,
    });
  });
  it("pronta entrega filtra ACF gratuito no servidor", async () => {
    const data = await resolve("/pronta-entrega/");
    expect(data.list?.total).toBe(1);
    expect(data.list?.items[0].acf?.pronta_entrega).toBe(true);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toContainEqual(
      expect.stringContaining("produto?per_page=100&search="),
    );
  });
  it("Home tolera falha parcial e catálogo comunica indisponibilidade", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 503 }));
    const data = await resolve("/");
    expect(data).toMatchObject({
      kind: "home",
      works: [],
      posts: [],
      pages: [],
      cities: [],
      tax: { brands: [], models: [], categories: [] },
    });
    expect(data.error).toContain("temporariamente indisponíveis");
    await expect(resolve("/produtos/")).rejects.toMatchObject({ status: 503 });
  });
  it("URLs não reconhecidas retornam 404", async () => {
    await expect(resolve("/nao/existe/aqui/")).rejects.toMatchObject({
      isNotFound: true,
    });
  });
});

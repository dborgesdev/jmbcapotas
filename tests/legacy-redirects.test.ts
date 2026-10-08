import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();
beforeEach(() => {
  vi.resetModules();
  fetchMock.mockReset().mockImplementation(async (url: string) => {
    const parsed = new URL(url);
    const endpoint = parsed.pathname.split("/").pop();
    const slug = parsed.searchParams.get("slug");
    const rows = endpoint === "posts" || endpoint === "produto"
      ? [
          { id: 1, slug: "teste", title: { rendered: "Teste" }, content: { rendered: "" }, featured_media: 0, categoria_produto: [], modelo: [] },
          { id: 2, slug: "capota-de-fibra-basica-para-ford-ranger", title: { rendered: "Ranger" }, content: { rendered: "" }, featured_media: 0, categoria_produto: [], modelo: [] },
        ]
      : [];
    const filtered = slug ? rows.filter((row) => row.slug === slug) : rows;
    return new Response(JSON.stringify(filtered), {
      headers: { "x-wp-total": String(filtered.length), "x-wp-totalpages": "1" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("Redirecionamentos históricos", () => {
  const check = async (path: string, brands: Array<{ id: number; slug: string; name: string }> = []) => {
    const { legacyRedirect } = await import("../src/lib/site/legacy-redirects");
    return legacyRedirect(path, [], brands as Parameters<typeof legacyRedirect>[2]);
  };
  it("redireciona página antiga da Dodge para a marca publicada", async () => {
    await expect(check("/marcas/capota-de-fibra-para-dodge-venda-e-instalacao/", [
      { id: 1, slug: "dodge", name: "Dodge" },
    ])).rejects.toMatchObject({
      status: 301,
      options: { statusCode: 301, to: "/$/", params: { _splat: "marcas/capota-de-fibra-para-dodge" } },
    });
  });
  it("não redireciona marca antiga sem taxonomia correspondente", async () => {
    await expect(check("/marcas/capota-de-fibra-para-inexistente-venda-e-instalacao/")).rejects.toMatchObject({ isNotFound: true });
  });
  it.each(["/tag/antigo/", "/category/venda-de-capota/"])(
    "envia arquivo de taxonomia %s ao catálogo",
    async (path) => {
      await expect(check(path)).rejects.toMatchObject({
        status: 301,
        options: { statusCode: 301, to: "/$/", params: { _splat: "produtos" } },
      });
    },
  );
  it("redireciona artigo histórico quando o slug existe", async () => {
    await expect(check("/venda-de-capota/teste/")).rejects.toMatchObject({
      status: 301,
      options: { statusCode: 301, params: { _splat: "blog/teste" } },
    });
  });
  it("redireciona produto antigo exato ao endereço canônico", async () => {
    await expect(check("/capota-para-picapes/teste/")).rejects.toMatchObject({
      status: 301,
      options: { statusCode: 301, params: { _splat: "produtos/teste" } },
    });
  });
  it("redireciona somente um slug legado revisado para o produto real", async () => {
    await expect(check("/capota-para-picapes/capota-basica-para-ford-ranger/")).rejects.toMatchObject({
      status: 301,
      options: { statusCode: 301, params: { _splat: "produtos/capota-de-fibra-basica-para-ford-ranger" } },
    });
  });
  it("não redireciona URL antiga sem equivalente para produto genérico", async () => {
    await expect(check("/capota-para-picapes/inexistente/")).rejects.toMatchObject({
      isNotFound: true,
    });
  });
});

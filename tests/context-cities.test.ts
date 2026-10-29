import { afterEach, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());
it("fetches only footer cities normally, all cities on the index, and preserves individual slug lookup", async () => {
  vi.resetModules();
  const fetch = vi.fn().mockImplementation(async (input: string) => {
    const url = new URL(input);
    if (url.pathname.endsWith("/cidade")) {
      const page = Number(url.searchParams.get("page") || 1);
      const count = url.searchParams.has("slug")
        ? 1
        : Number(url.searchParams.get("per_page"));
      return new Response(
        JSON.stringify(
          Array.from({ length: count }, (_, index) => ({
            id: (page - 1) * 100 + index + 1,
            slug: `cidade-${(page - 1) * 100 + index + 1}`,
            title: { rendered: `Cidade ${(page - 1) * 100 + index + 1}` },
            content: { rendered: "<p>Conteúdo local.</p>" },
            featured_media: 0,
            acf: { estado: "PR" },
          })),
        ),
        { headers: { "x-wp-totalpages": "2" } },
      );
    }
    return new Response("[]");
  });
  vi.stubGlobal("fetch", fetch);
  const { siteContext } = await import("../src/lib/site/context");
  const footer = (await siteContext("/produtos/", {})).base.cities;
  expect(footer).toHaveLength(4);
  expect(
    fetch.mock.calls.filter(([url]) => String(url).includes("/cidade?")),
  ).toHaveLength(1);
  expect(fetch.mock.calls.map(([url]) => String(url))).toContainEqual(
    expect.stringContaining("cidade?per_page=4&page=1"),
  );
  const all = (await siteContext("/cidades/", {})).base.cities;
  expect(all).toHaveLength(200);
  expect(
    fetch.mock.calls.filter(([url]) => String(url).includes("/cidade?")),
  ).toHaveLength(3);
  expect(all.slice(0, 4)).toEqual(footer);
  const { cityBySlug } = await import("../src/lib/wordpress/cities");
  expect((await cityBySlug("cidade-1"))?.url).toBe(
    "/venda-de-capota-para-picape-em-cidade-1/",
  );
  expect(
    fetch.mock.calls.map(([url]) => new URL(url).searchParams.get("page")),
  ).toContain("2");
});

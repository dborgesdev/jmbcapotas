import { afterEach, expect, it, vi } from "vitest";
import type { RawPost } from "../src/lib/wordpress/types";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const raw = (id = 1): RawPost => ({
  id,
  slug: `city-${id}`,
  title: { rendered: "Cidade" },
  content: {
    rendered:
      "<p>Conteúdo editorial com detalhes suficientes para apresentar uma introdução.</p>",
  },
  featured_media: 0,
  date: "2026-10-29",
  modified: "2026-10-29",
  acf: { estado: "PR" },
});

it("requests four footer cities and builds the complete index without processing editorial HTML", async () => {
  vi.resetModules();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation(
        async (input: string) =>
          new Response(
            JSON.stringify(
              Array.from(
                { length: Number(new URL(input).searchParams.get("per_page")) },
                (_, i) => raw(i + 1),
              ),
            ),
            { headers: { "x-wp-totalpages": "1", "x-wp-total": "100" } },
          ),
      ),
  );
  const html = await import("../src/lib/wordpress/html");
  const sanitize = vi.spyOn(html, "safeHtml");
  const { footerCities, cityLinks } =
    await import("../src/lib/wordpress/cities");
  const footer = await footerCities();
  expect(footer).toHaveLength(4);
  expect(sanitize).not.toHaveBeenCalled();
  expect(await footerCities()).toEqual(footer);
  expect(sanitize).not.toHaveBeenCalled();
  const index = await cityLinks({ per_page: 100, page: 1 });
  expect(index.items).toHaveLength(100);
  expect(index.items.slice(0, 4)).toEqual(footer);
  expect(sanitize).not.toHaveBeenCalled();
  expect(footer[0]).not.toHaveProperty("html");
  expect(footer[0]).not.toHaveProperty("images");
});

it("does not reuse editorial text from a new response or edited input", async () => {
  const { postContent } = await import("../src/lib/wordpress/post-content");
  const first = raw();
  expect(postContent(first)).toBe(postContent(first));
  const next = {
    ...first,
    content: {
      rendered: "<p>Descrição atualizada.</p><script>alert(1)</script>",
    },
  };
  expect(postContent(next).summary).toBe("Descrição atualizada.");
  expect(postContent(next).html).not.toContain("script");
  first.content.rendered = "<p>Texto alterado.</p>";
  expect(postContent(first).summary).toBe("Texto alterado.");
});

it("serializes only public normalized post fields without raw duplicate HTML or REST metadata", async () => {
  const { normalizePost } = await import("../src/lib/wordpress/normalize");
  const value = Object.assign(raw(), {
    guid: { rendered: "https://cms.test/internal" },
    _links: { self: [{ href: "https://cms.test/wp-json/..." }] },
    meta: { administrative: "unused" },
  });
  const post = await normalizePost(value, "/cidade/");
  expect(post.html).toContain("Conteúdo editorial");
  expect(post).not.toHaveProperty("content");
  expect(post).not.toHaveProperty("title");
  expect(post).not.toHaveProperty("guid");
  expect(post).not.toHaveProperty("_links");
  expect(post).not.toHaveProperty("meta");
  expect(post).toMatchObject({
    id: 1,
    slug: "city-1",
    acf: { estado: "PR" },
    url: "/cidade/",
  });
});

it("builds all sitemap URLs from routing fields without media or HTML processing", async () => {
  vi.resetModules();
  const fetch = vi.fn().mockImplementation(async (input: string) => {
    const url = new URL(input);
    const endpoint = url.pathname.split("/").pop();
    const page = Number(url.searchParams.get("page") || 1);
    const data =
      endpoint === "marca"
        ? [{ id: 4, slug: "fiat" }]
        : endpoint === "categoria_produto"
          ? [
              { id: 3, slug: "capota-de-fibra", parent: 0 },
              { id: 6, slug: "filha", parent: 3 },
            ]
          : endpoint === "produto"
            ? [{ id: 44, slug: "capota", categoria_produto: [6], modelo: [5] }]
            : endpoint === "cidade"
              ? Array.from({ length: page === 1 ? 100 : 7 }, (_, i) => ({
                  id: (page - 1) * 100 + i + 1,
                  slug: `cidade-${(page - 1) * 100 + i + 1}`,
                }))
              : [{ id: 1, slug: "conteudo" }];
    return new Response(JSON.stringify(data), {
      headers: { "x-wp-totalpages": endpoint === "cidade" ? "2" : "1" },
    });
  });
  vi.stubGlobal("fetch", fetch);
  const html = await import("../src/lib/wordpress/html");
  const sanitize = vi.spyOn(html, "safeHtml");
  const { sitemapUrls } = await import("../src/lib/wordpress/sitemap");
  const urls = await sitemapUrls();
  expect(urls).toContain("/capota-para-picape/capota/");
  expect(urls).toContain("/marcas/capota-de-fibra-para-fiat/");
  expect(urls).toContain("/venda-de-capota-para-picape-em-cidade-107/");
  expect(sanitize).not.toHaveBeenCalled();
  expect(
    fetch.mock.calls.every(
      ([url]) =>
        !String(url).includes("/media") && !String(url).includes("/modelo?"),
    ),
  ).toBe(true);
  expect(
    fetch.mock.calls.every(([url]) => new URL(url).searchParams.has("_fields")),
  ).toBe(true);
});

it("resolves unconditional redirects and impossible deep URLs before loading CMS context", async () => {
  vi.resetModules();
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const { resolveRoute } = await import("../src/lib/site/resolve-route");
  await expect(
    resolveRoute({ path: "/carrinho/", search: {} }),
  ).rejects.toMatchObject({ status: 301 });
  await expect(
    resolveRoute({ path: "/category/arquivo/antigo/", search: {} }),
  ).rejects.toMatchObject({ status: 301 });
  await expect(
    resolveRoute({ path: "/nao/existe/aqui/", search: {} }),
  ).rejects.toMatchObject({ isNotFound: true });
  expect(fetch).not.toHaveBeenCalled();
});

it("serializes only normalized taxonomy fields while preserving hierarchy and dependent filters", async () => {
  vi.resetModules();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              id: 5,
              slug: "strada",
              name: "Strada &amp; outras",
              description: "<p>Descrição</p>",
              count: 0,
              parent: 3,
              acf: { marca: 4 },
              _links: { self: [{ href: "https://cms.test/term" }] },
              taxonomy: "modelo",
            },
          ]),
        ),
      ),
  );
  const { terms } = await import("../src/lib/wordpress/taxonomies");
  const [term] = await terms("modelo");
  expect(term).toMatchObject({
    id: 5,
    name: "Strada & outras",
    description: "Descrição",
    parent: 3,
    count: 0,
    acf: { marca: 4 },
  });
  expect(term).not.toHaveProperty("_links");
  expect(term).not.toHaveProperty("taxonomy");
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { all, request, CmsError } from "../src/lib/wordpress/client";
import { normalizePost } from "../src/lib/wordpress/normalize";
import { pageBySlug } from "../src/lib/wordpress/pages";
import { clients } from "../src/lib/wordpress/clients";
afterEach(() => vi.unstubAllGlobals());
describe("REST WordPress", () => {
  it("consome cliente apenas com title e featured_media e tolera logo ausente", async () => {
    const fetchMock = vi.fn().mockImplementation(
      async (url: string) =>
        new Response(
          JSON.stringify(
            url.includes("/media/")
              ? {
                  id: 801,
                  source_url: "https://example.test/logo.webp",
                  media_details: { width: 500, height: 200 },
                }
              : [
                  {
                    id: 1,
                    title: { rendered: "Cliente &amp; nome" },
                    featured_media: 801,
                  },
                  { id: 2, title: { rendered: "Sem logo" }, featured_media: 0 },
                ],
          ),
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const entries = await clients();
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/cliente?per_page=100",
    );
    expect(entries[0]).toMatchObject({
      name: "Cliente & nome",
      logo: { id: 801 },
    });
    expect(entries[1].logo).toBeUndefined();
  });
  it("deriva introdução do editor, ignorando parágrafo que contém apenas o nome", async () => {
    const post = await normalizePost(
      {
        id: 8,
        slug: "introducao",
        title: { rendered: "JMB" },
        content: {
          rendered:
            "<p>JMB Capotas</p><p>Explore as opções para seu veículo e confira os detalhes. Converse com a equipe.</p>",
        },
        date: "2026-10-07",
        modified: "2026-10-07",
        featured_media: 0,
      },
      "/introducao/",
    );
    expect(post.introduction).toBe(
      "Explore as opções para seu veículo e confira os detalhes.",
    );
  });
  it("consulta Pages pelo slug original e preserva a URL pública", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 88,
            slug: "quem-somos-teste",
            title: { rendered: "Quem somos" },
            content: { rendered: "<p>Conteúdo nativo.</p>" },
            featured_media: 0,
            date: "2026-10-07",
            modified: "2026-10-07",
          },
        ]),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const page = await pageBySlug("quem-somos-teste");
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "pages?per_page=12&slug=quem-somos-teste",
    );
    expect(page.url).toBe("/quem-somos-teste/");
    expect(page.html).toBe("<p>Conteúdo nativo.</p>");
  });
  it("deduplica consultas simultâneas e usa cache público", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: 1 }]), {
        headers: { "x-wp-total": "1", "x-wp-totalpages": "1" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const [a, b] = await Promise.all([
      request("cache-test"),
      request("cache-test"),
    ]);
    expect(a).toEqual(b);
    await request("cache-test");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("percorre todas as páginas sem depender de limite fixo", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(
        async (url: string) =>
          new Response(
            JSON.stringify([{ id: url.includes("page=2") ? 2 : 1 }]),
            { headers: { "x-wp-totalpages": "2" } },
          ),
      );
    vi.stubGlobal("fetch", fetchMock);
    expect(await all("pagination-test")).toEqual([{ id: 1 }, { id: 2 }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("preserva código de erro REST e permite tentar novamente", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ code: "rest_post_invalid_page_number" }),
          { status: 400 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    await expect(request("error-test")).rejects.toMatchObject({
      status: 400,
      code: "rest_post_invalid_page_number",
    });
    fetchMock.mockResolvedValue(new Response("[]"));
    await expect(request("error-test")).resolves.toMatchObject({ data: [] });
    expect(new CmsError(503).message).toContain("Tente novamente");
  });
  it("normaliza galeria ACF gratuita, vazios e mídia ausente", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (url: string) =>
        url.endsWith("/media/702")
          ? new Response("{}", { status: 404 })
          : new Response(
              JSON.stringify({
                id: 701,
                source_url: "https://example.test/real.jpg",
                alt_text: "Capota",
                media_details: { width: 900, height: 700 },
              }),
            ),
      ),
    );
    const post = await normalizePost(
      {
        id: 7,
        slug: "galeria",
        title: { rendered: "Capota" },
        content: { rendered: "<p>Descrição do editor.</p>" },
        date: "2026-10-07",
        modified: "2026-10-07",
        featured_media: 701,
        acf: {
          galeria: {
            imagem_2: 701,
            imagem_3: "",
            imagem_4: null,
            imagem_5: 702,
          },
        },
      },
      "/produtos/galeria/",
    );
    expect(post.images).toHaveLength(1);
    expect(post.images[0].id).toBe(701);
    expect(post.summary).toBe("Descrição do editor.");
    expect(post.url).toBe("/produtos/galeria/");
  });
});

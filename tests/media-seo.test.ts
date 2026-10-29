import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Media, RawPost } from "../src/lib/wordpress/types";
import type { SiteData } from "../src/lib/site/types";
import { seo } from "../src/lib/seo";

const image: Media = {
  id: 41,
  url: "https://example.test/a.webp",
  alt: "Capota &amp; veículo",
  width: 1080,
  height: 720,
  srcSet: "https://example.test/a.webp 1080w",
};
const raw: RawPost = {
  id: 1,
  slug: "capota",
  title: { rendered: "Capota" },
  content: { rendered: "<p>Descrição real</p>" },
  date: "",
  modified: "",
  featured_media: 41,
  acf: {
    galeria: { imagem_2: 41, imagem_3: 42, imagem_4: null, imagem_5: "" },
  },
};
beforeEach(() => vi.resetModules());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("prefers resolved media, preserves order, deduplicates and honors deleted attachments", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const { normalizePost } = await import("../src/lib/wordpress/normalize");
  const post = await normalizePost(
    {
      ...raw,
      _embedded: { "wp:featuredmedia": [image] },
      acf: { galeria: { imagem_2: image, imagem_3: null } },
    },
    "/capota/",
  );
  expect(post.images).toEqual([{ ...image, alt: "Capota & veículo" }]);
  expect(fetch).not.toHaveBeenCalled();
  expect(post).not.toHaveProperty("_embedded");
  const gallery = await normalizePost(
    {
      ...raw,
      featured_media: 0,
      acf: { galeria: { imagem_2: null, imagem_3: { ...image, id: 42 } } },
    },
    "/capota/",
  );
  expect(gallery.images.map((m) => m.id)).toEqual([42]);
  expect(fetch).not.toHaveBeenCalled();
});

it("consumes native embedded metadata and ACF arrays with no second HTTP request", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const { media } = await import("../src/lib/wordpress/media");
  expect(await media({ ...image, id: undefined, ID: 41 })).toMatchObject({
    id: 41,
    width: 1080,
  });
  expect(
    await media(41, {
      id: 41,
      source_url: image.url,
      alt_text: "Foto",
      media_details: {
        width: 1080,
        height: 720,
        sizes: { medium: { source_url: image.url, width: 300 } },
      },
    }),
  ).toMatchObject({ srcSet: `${image.url} 300w`, alt: "Foto" });
  expect(await media(null)).toBeUndefined();
  expect(fetch).not.toHaveBeenCalled();
});

it("falls back for incomplete metadata, deduplicates concurrent IDs and expires at 60 seconds", async () => {
  vi.useFakeTimers();
  const fetch = vi.fn().mockImplementation(
    async () =>
      new Response(
        JSON.stringify({
          id: 41,
          source_url: image.url,
          media_details: { width: 1080, height: 720 },
        }),
      ),
  );
  vi.stubGlobal("fetch", fetch);
  const { media } = await import("../src/lib/wordpress/media");
  const { observeRest } = await import("../src/lib/wordpress/client");
  const events: string[] = [];
  observeRest((e) => events.push(e.source));
  await Promise.all([media(41, { id: 41 }), media("41")]);
  await media(41);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(events).toEqual(["http", "pending", "cache"]);
  vi.advanceTimersByTime(60001);
  await media(41);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("tolerates missing attachments and retries failed endpoints", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response("{}", { status: 404 }));
  vi.stubGlobal("fetch", fetch);
  const { media } = await import("../src/lib/wordpress/media");
  expect(await media(42)).toBeUndefined();
  expect(await media(42)).toBeUndefined();
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("batches native attachments, omits deleted IDs and reuses concurrent/cached requests", async () => {
  const fetch = vi.fn().mockImplementation(
    async () =>
      new Response(
        JSON.stringify([
          {
            id: 41,
            source_url: image.url,
            media_details: { width: 1080, height: 720 },
          },
        ]),
      ),
  );
  vi.stubGlobal("fetch", fetch);
  const { mediaBatch } = await import("../src/lib/wordpress/media");
  const [a, b] = await Promise.all([
    mediaBatch([42, 41, 41, null]),
    mediaBatch([41, 42]),
  ]);
  expect(a).toEqual(b);
  expect(a.get(41)?.url).toBe(image.url);
  expect(a.get(42)).toBeNull();
  await mediaBatch([41, 42]);
  expect(fetch).toHaveBeenCalledTimes(1);
  const url = new URL(fetch.mock.calls[0][0]);
  expect(url.pathname).toMatch(/\/media$/);
  expect(url.searchParams.get("include")).toBe("41,42");
});

it("keeps individual fallback after partial native batch failure", async () => {
  const fetch = vi.fn().mockImplementation(async (url: string) =>
    url.includes("media?")
      ? new Response("{}", { status: 503 })
      : new Response(
          JSON.stringify({
            id: Number(url.split("/").pop()),
            source_url: image.url,
            media_details: { width: 1080, height: 720 },
          }),
        ),
  );
  vi.stubGlobal("fetch", fetch);
  const { normalizePost } = await import("../src/lib/wordpress/normalize");
  const post = await normalizePost(raw, "/capota/");
  expect(post.images.map((m) => m.id)).toEqual([41, 42]);
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("preserves responsive candidates from native ACF standard arrays", async () => {
  const { media } = await import("../src/lib/wordpress/media");
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  expect(
    await media({
      ID: 41,
      url: image.url,
      alt: "Capota",
      width: 1080,
      height: 720,
      sizes: {
        medium: "https://example.test/300.webp",
        "medium-width": 300,
        thumbnail: "https://example.test/150.webp",
        "thumbnail-width": 150,
      },
    }),
  ).toMatchObject({
    srcSet: `https://example.test/300.webp 300w, ${image.url} 1080w`,
  });
  expect(fetch).not.toHaveBeenCalled();
});

it.each([false, true])(
  "resolves independent Hero/CTA with shared IDs=%s without HTTP",
  async (same) => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const { normalizeSiteConfig } =
      await import("../src/lib/wordpress/site-config");
    const other = { ...image, id: same ? 41 : 42 };
    const config = await normalizeSiteConfig({ hero: image, final_cta: other });
    expect(config.hero?.id).toBe(41);
    expect(config.finalCta?.id).toBe(other.id);
    expect(fetch).not.toHaveBeenCalled();
  },
);

it("resolves taxonomy media and leaves absent backgrounds empty", async () => {
  const fetch = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify([
        {
          id: 3,
          name: "Marca",
          description: "",
          slug: "marca",
          count: 0,
          acf: { logo: image, imagem_fundo: null },
        },
      ]),
    ),
  );
  vi.stubGlobal("fetch", fetch);
  const { terms } = await import("../src/lib/wordpress/taxonomies");
  expect((await terms("marca"))[0]).toMatchObject({
    image: { id: 41 },
    background: undefined,
  });
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("reuses the resolved CTA when Hero has the same legacy ID", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const { normalizeSiteConfig } =
    await import("../src/lib/wordpress/site-config");
  const config = await normalizeSiteConfig({ hero: 41, final_cta: image });
  expect(config.hero).toBe(config.finalCta);
  expect(config.hero?.id).toBe(41);
  expect(fetch).not.toHaveBeenCalled();
});

it.each(["home", "catalog", "page", "404", "product", "work", "article"])(
  "provides one absolute OG/Twitter image for %s",
  (kind) => {
    const data: SiteData = {
      kind,
      title: "Teste",
      path: "/teste/",
      tax: { brands: [], models: [], categories: [] },
      pages: [],
      cities: [],
      search: {},
    };
    const result = seo(data);
    expect(
      result.meta.filter((m) => "property" in m && m.property === "og:image"),
    ).toEqual([
      {
        property: "og:image",
        content: "https://jmbcapotas.com.br/og-image.webp",
      },
    ]);
    expect(result.meta).toContainEqual({
      name: "twitter:card",
      content: "summary_large_image",
    });
    data.post = {
      ...raw,
      name: "Capota",
      html: "",
      summary: "Descrição",
      images: [image],
      url: "/capota/",
    };
    expect(seo(data).meta).toContainEqual({
      property: "og:image",
      content:
        kind === "home" ? "https://jmbcapotas.com.br/og-image.webp" : image.url,
    });
  },
);

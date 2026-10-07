import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { SiteView } from "../src/components/site";
import type { SiteData } from "../src/lib/site/types";
import type { Post } from "../src/lib/wordpress/types";

// Synthetic data is used only to exercise the existing V1 markup, never as CMS content.
const post: Post = {
  id: 1,
  slug: "teste",
  name: "Conteúdo de teste",
  html: "<p>Descrição.</p>",
  summary: "Descrição.",
  featured_media: 1,
  date: "2026-10-07T12:00:00",
  modified: "2026-10-07T13:00:00",
  url: "/produtos/teste/",
  categoria_produto: [2],
  marca: [3],
  modelo: [4],
  acf: { codigo_produto: "TEST", pronta_entrega: true, estado: "PR" },
  images: [1, 2].map((id) => ({
    id,
    url: `https://example.test/${id}.jpg`,
    alt: "Imagem de teste",
    width: 900,
    height: 700,
    srcSet: "",
  })),
};
const base: SiteData = {
  kind: "home",
  title: "Título",
  path: "/",
  search: {},
  tax: {
    brands: [
      {
        id: 3,
        name: "Marca",
        slug: "marca",
        description: "",
        count: 1,
        image: post.images[0],
      },
    ],
    models: [
      {
        id: 4,
        name: "Modelo",
        slug: "modelo",
        description: "",
        count: 1,
        acf: { marca: 3 },
        image: post.images[0],
      },
    ],
    categories: [
      {
        id: 2,
        name: "Categoria",
        slug: "categoria",
        description: "Linha",
        count: 1,
        image: post.images[0],
      },
    ],
  },
  pages: [{ ...post, slug: "quem-somos", url: "/quem-somos/" }],
  cities: [post],
  works: [post],
  posts: [post],
  post,
  related: [post],
  list: { items: [post], total: 25, pages: 3 },
  blogCategories: [{ id: 2, name: "Categoria" }],
};
const cases: Record<string, SiteData> = {
  home: base,
  "home sem conteúdo": {
    ...base,
    tax: { brands: [], models: [], categories: [] },
    pages: [],
    post: undefined,
    works: [],
    posts: [],
    error: "Indisponível",
  },
  catalog: {
    ...base,
    kind: "catalog",
    path: "/produtos/",
    search: { q: "teste", marca: "3", modelo: "4", pagina: 2 },
  },
  brand: {
    ...base,
    kind: "catalog",
    path: "/marcas/capota-de-fibra-para-marca/",
    brandId: 3,
  },
  category: {
    ...base,
    kind: "catalog",
    path: "/produtos/categoria/",
    categoryId: 2,
  },
  ready: { ...base, kind: "catalog", path: "/pronta-entrega/" },
  "catalog vazio": {
    ...base,
    kind: "catalog",
    path: "/produtos/",
    list: { items: [], total: 0, pages: 0 },
  },
  product: { ...base, kind: "product", path: post.url },
  "produto sem imagens": {
    ...base,
    kind: "product",
    path: post.url,
    post: { ...post, images: [] },
    related: [],
  },
  ...Object.fromEntries(
    ["article", "work", "city", "page"].map((kind) => [
      kind,
      { ...base, kind, path: `/${kind}/` },
    ]),
  ),
  ...Object.fromEntries(
    ["cart", "cities", "blog", "works"].flatMap((kind) => [
      [kind, { ...base, kind, path: `/${kind}/`, post: undefined }],
      [
        `${kind} vazio`,
        {
          ...base,
          kind,
          path: `/${kind}/`,
          post: undefined,
          cities: [],
          list: { items: [], total: 0, pages: 0 },
        },
      ],
    ]),
  ),
};
describe("HTML da V1 após refinamento visual", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-07T12:00:00Z"));
  });
  afterAll(() => vi.useRealTimers());
  for (const [name, data] of Object.entries(cases)) {
    it(name, () => {
      const html = renderToStaticMarkup(<SiteView data={data} />);
      expect(createHash("sha256").update(html).digest("hex")).toMatchSnapshot();
    });
  }
});

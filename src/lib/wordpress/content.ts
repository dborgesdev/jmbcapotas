import sanitizeHtml from "sanitize-html";
import { request, all } from "./client";
import { cityUrl } from "../paths";
export { cityUrl, brandUrl } from "../paths";
import type {
  Media,
  Post,
  RawPost,
  Term,
  Taxonomies,
  Collection,
} from "./types";
export function clean(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function safeHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading"],
      a: ["href", "title"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      h1: "h2",
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
    },
  });
}
type RawMedia = {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes?: Record<string, { source_url: string; width: number }>;
  };
};
export async function media(id: unknown): Promise<Media | undefined> {
  if (!Number(id)) return undefined;
  try {
    const { data: m } = await request<RawMedia>(`media/${Number(id)}`);
    return {
      id: m.id,
      url: m.source_url,
      alt: clean(m.alt_text || ""),
      width: m.media_details.width,
      height: m.media_details.height,
      srcSet: Object.values(m.media_details.sizes || {})
        .filter((s) => s.width > 200)
        .map((s) => `${s.source_url} ${s.width}w`)
        .join(", "),
    };
  } catch {
    return undefined;
  }
}
export async function terms(endpoint: string): Promise<Term[]> {
  return Promise.all(
    (await all<Term>(endpoint)).map(async (t) => ({
      ...t,
      name: clean(t.name),
      description: clean(t.description),
      image: await media(t.acf?.logo || t.acf?.imagem),
      background: await media(t.acf?.imagem_fundo),
    })),
  );
}
export async function taxonomies(): Promise<Taxonomies> {
  const [brands, models, categories] = await Promise.all([
    terms("marca"),
    terms("modelo"),
    terms("categoria_produto"),
  ]);
  return { brands, models, categories };
}

export function fiberCategory(ids: number[], categories: Term[]): boolean {
  return ids.some((id) => {
    const visited = new Set<number>();
    let term = categories.find((c) => c.id === id);
    while (term && !visited.has(term.id)) {
      if (term.slug === "capota-de-fibra") return true;
      visited.add(term.id);
      term = categories.find((c) => c.id === term?.parent);
    }
    return false;
  });
}
export function productUrl(
  p: Pick<RawPost, "slug" | "categoria_produto" | "modelo">,
  categories: Term[],
) {
  return `${fiberCategory(p.categoria_produto || [], categories) && p.modelo?.length ? "/capota-para-picape/" : "/produtos/"}${p.slug}/`;
}
export async function normalize(
  p: RawPost,
  endpoint: string,
  categories: Term[] = [],
): Promise<Post> {
  const ids = [
    ...new Set(
      [p.featured_media, ...Object.values(p.acf?.galeria || {})]
        .map(Number)
        .filter(Boolean),
    ),
  ];
  const images = (await Promise.all(ids.map(media))).filter(
    (m): m is Media => !!m,
  );
  return {
    ...p,
    name: clean(p.title.rendered),
    html: safeHtml(p.content.rendered),
    summary: clean(p.content.rendered).slice(0, 170),
    images,
    url:
      endpoint === "produto"
        ? productUrl(p, categories)
        : endpoint === "cidade"
          ? cityUrl(p.slug)
          : endpoint === "pages"
            ? `/${p.slug}/`
            : `/${endpoint === "posts" ? "blog" : "trabalhos"}/${p.slug}/`,
  };
}
export async function collection(
  endpoint: string,
  params: Record<string, string | number> = {},
  categories: Term[] = [],
): Promise<Collection<Post>> {
  const query = new URLSearchParams({
    per_page: "12",
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => v !== "")
        .map(([k, v]) => [k, String(v)]),
    ),
  });
  const result = await request<RawPost[]>(`${endpoint}?${query}`);
  return {
    items: await Promise.all(
      result.data.map((p) => normalize(p, endpoint, categories)),
    ),
    total: result.total,
    pages: result.pages,
  };
}
export async function bySlug(
  endpoint: string,
  slug: string,
  categories: Term[] = [],
) {
  return (await collection(endpoint, { slug }, categories)).items[0];
}

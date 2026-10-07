import { createServerFn } from "@tanstack/react-start";
import { notFound, redirect } from "@tanstack/react-router";
import { all, CmsError } from "./client";
import { bySlug, collection, taxonomies, normalize, terms } from "./content";
import type { Post, Taxonomies, Collection, RawPost } from "./types";
export type Search = {
  q?: string;
  categoria?: string;
  marca?: string;
  modelo?: string;
  pagina?: number;
  blogCategoria?: string;
};
export type SiteData = {
  kind: string;
  title: string;
  path: string;
  tax: Taxonomies;
  pages: Post[];
  cities: Post[];
  list?: Collection<Post>;
  post?: Post;
  works?: Post[];
  posts?: Post[];
  related?: Post[];
  blogCategories?: { id: number; name: string }[];
  search: Search;
  error?: string;
  brandId?: number;
  categoryId?: number;
};
export const loadSite = createServerFn({ method: "GET" })
  .validator((input: { path: string; search: Search }) => input)
  .handler(async ({ data }): Promise<SiteData> => {
    const path = `/${data.path.replace(/^\/+|\/+$/g, "")}${data.path.replace(/^\/+|\/+$/g, "") ? "/" : ""}`;
    const [taxResult, pagesResult, citiesResult] = await Promise.allSettled([
      taxonomies(),
      collection("pages", { per_page: 100 }),
      collection("cidade", { per_page: 100 }),
    ]);
    const tax =
      taxResult.status === "fulfilled"
        ? taxResult.value
        : { brands: [], models: [], categories: [] };
    const base: SiteData = {
      kind: "",
      title: "",
      path,
      tax,
      pages: pagesResult.status === "fulfilled" ? pagesResult.value.items : [],
      cities:
        citiesResult.status === "fulfilled" ? citiesResult.value.items : [],
      search: data.search,
    };
    const s = data.search;
    const catalog = async (
      title: string,
      brandId?: number,
      categoryId?: number,
      ready = false,
    ) => {
      base.kind = "catalog";
      base.title = title;
      base.brandId = brandId;
      base.categoryId = categoryId;
      if (taxResult.status === "rejected") throw taxResult.reason;
      const marca = brandId || Number(s.marca) || undefined;
      const modelo = tax.models.find(
        (m) => m.id === Number(s.modelo) && Number(m.acf?.marca) === marca,
      )?.id;
      const params = {
        search: s.q || "",
        page: s.pagina || 1,
        ...(marca ? { marca } : {}),
        ...(modelo ? { modelo } : {}),
        ...(categoryId || Number(s.categoria)
          ? { categoria_produto: categoryId || Number(s.categoria) }
          : {}),
      };
      if (ready) {
        // ACF free does not expose a REST meta filter. Scan paginated pages on the server only.
        const raw = (
          await all<RawPost>(
            "produto",
            `&${new URLSearchParams(
              Object.entries(params)
                .filter(([k]) => k !== "page")
                .map(([k, v]) => [k, String(v)]),
            )}`,
          )
        ).filter((p) => p.acf?.pronta_entrega === true);
        const page = s.pagina || 1;
        base.list = {
          items: await Promise.all(
            raw
              .slice((page - 1) * 12, page * 12)
              .map((p) => normalize(p, "produto", tax.categories)),
          ),
          total: raw.length,
          pages: Math.ceil(raw.length / 12),
        };
      } else base.list = await collection("produto", params, tax.categories);
      if ((s.pagina || 1) > Math.max(1, base.list.pages)) throw notFound();
      return base;
    };
    try {
      if (path === "/") {
        base.kind = "home";
        base.title = "Capotas para acompanhar seu caminho";
        const results = await Promise.allSettled([
          collection("trabalho", { per_page: 3 }),
          collection("posts", { per_page: 3 }),
          collection("produto", { per_page: 1 }, tax.categories),
        ]);
        base.works =
          results[0].status === "fulfilled" ? results[0].value.items : [];
        base.posts =
          results[1].status === "fulfilled" ? results[1].value.items : [];
        base.post =
          results[2].status === "fulfilled"
            ? results[2].value.items[0]
            : undefined;
        if (taxResult.status === "rejected")
          base.error =
            "As marcas estão temporariamente indisponíveis. Fale com nossa equipe.";
        return base;
      }
      if (path === "/produtos/")
        return await catalog("Encontre a capota para sua picape");
      if (path === "/pronta-entrega/")
        return await catalog(
          "Capotas em pronta entrega",
          undefined,
          undefined,
          true,
        );
      if (path === "/carrinho/")
        return { ...base, kind: "cart", title: "Seu carrinho" };
      if (path === "/cidades/")
        return { ...base, kind: "cities", title: "JMB na sua cidade" };
      if (/^\/marcas\/capota-de-fibra-para-[^/]+\/$/.test(path)) {
        const slug = path.split("/")[2].replace("capota-de-fibra-para-", "");
        const brand = tax.brands.find((t) => t.slug === slug);
        if (!brand) {
          if (taxResult.status === "rejected") throw taxResult.reason;
          throw notFound();
        }
        return await catalog(`Capotas para ${brand.name}`, brand.id);
      }
      if (/^\/(produtos|capota-para-picape)\/[^/]+\/$/.test(path)) {
        if (taxResult.status === "rejected") throw taxResult.reason;
        const slug = path.split("/")[2];
        const category =
          path.startsWith("/produtos/") &&
          tax.categories.find((c) => c.slug === slug);
        if (category)
          return await catalog(category.name, undefined, category.id);
        const post = await bySlug("produto", slug, tax.categories);
        if (!post) throw notFound();
        if (post.url !== path)
          throw redirect({
            to: "/$/",
            params: { _splat: post.url.slice(1, -1) },
            statusCode: 301,
          });
        const related = await collection(
          "produto",
          post.categoria_produto?.[0]
            ? { categoria_produto: post.categoria_produto[0], per_page: 5 }
            : { per_page: 5 },
          tax.categories,
        ).catch(() => ({ items: [], total: 0, pages: 0 }));
        return {
          ...base,
          kind: "product",
          title: post.name,
          post,
          related: related.items.filter((p) => p.id !== post.id).slice(0, 4),
        };
      }
      if (path === "/blog/" || path === "/trabalhos/") {
        const endpoint = path === "/blog/" ? "posts" : "trabalho";
        return {
          ...base,
          kind: endpoint === "posts" ? "blog" : "works",
          title:
            endpoint === "posts"
              ? "Na estrada com a JMB"
              : "Trabalhos que ganham a estrada",
          list: await collection(endpoint, {
            page: s.pagina || 1,
            search: s.q || "",
            ...(s.blogCategoria ? { categories: s.blogCategoria } : {}),
          }),
          blogCategories:
            endpoint === "posts"
              ? await terms("categories").catch(() => [])
              : [],
        };
      }
      const match = path.match(/^\/(blog|trabalhos)\/([^/]+)\/$/);
      if (match) {
        const post = await bySlug(
          match[1] === "blog" ? "posts" : "trabalho",
          match[2],
        );
        if (!post) throw notFound();
        const related = post.acf?.produto?.length
          ? (
              await collection(
                "produto",
                { include: post.acf.produto.join(",") },
                tax.categories,
              ).catch(() => ({ items: [], total: 0, pages: 0 }))
            ).items
          : [];
        return {
          ...base,
          kind: match[1] === "blog" ? "article" : "work",
          title: post.name,
          post,
          related,
        };
      }
      if (
        path.startsWith("/venda-de-capota-para-picape-em-") &&
        path.split("/").length === 3
      ) {
        const post = await bySlug(
          "cidade",
          path.slice(1, -1).replace("venda-de-capota-para-picape-em-", ""),
        );
        if (!post) throw notFound();
        return {
          ...base,
          kind: "city",
          title: `Capota para picape em ${post.name}${post.acf?.estado ? `/${post.acf.estado}` : ""}`,
          post,
        };
      }
      if (path.split("/").length === 3) {
        const post = await bySlug("pages", path.slice(1, -1));
        if (post) return { ...base, kind: "page", title: post.name, post };
      }
      throw notFound();
    } catch (error) {
      if (
        error instanceof CmsError &&
        error.code === "rest_post_invalid_page_number"
      )
        throw notFound();
      if (
        error &&
        typeof error === "object" &&
        ("isNotFound" in error || "isRedirect" in error)
      )
        throw error;
      throw error;
    }
  });

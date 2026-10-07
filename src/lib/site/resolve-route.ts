import { notFound } from "@tanstack/react-router";
import { CmsError } from "../wordpress/client";
import { pageBySlug } from "../wordpress/pages";
import { cityBySlug } from "../wordpress/cities";
import { siteContext } from "./context";
import { home } from "./home";
import { catalog } from "./catalog";
import { product } from "./product";
import { blog, article } from "./blog";
import { works, work } from "./works";
import type { Search, SiteData } from "./types";
export async function resolveRoute(input: {
  path: string;
  search: Search;
}): Promise<SiteData> {
  const slugPath = input.path.replace(/^\/+|\/+$/g, "");
  const path = "/" + slugPath + (slugPath ? "/" : "");
  const context = await siteContext(path, input.search);
  const { base, requireTaxonomies } = context;
  try {
    if (path === "/") return await home(context);
    if (path === "/produtos/")
      return await catalog(
        context,
        "Encontre o produto ideal para seu veículo",
      );
    if (path === "/pronta-entrega/")
      return await catalog(
        context,
        "Produtos em pronta entrega",
        undefined,
        undefined,
        true,
      );
    if (path === "/carrinho/")
      return { ...base, kind: "cart", title: "Seu carrinho" };
    if (path === "/cidades/")
      return { ...base, kind: "cities", title: "JMB na sua cidade" };
    if (/^\/marcas\/capota-de-fibra-para-[^/]+\/$/.test(path)) {
      const brand = base.tax.brands.find(
        (t) =>
          t.slug === path.split("/")[2].replace("capota-de-fibra-para-", ""),
      );
      if (!brand) {
        requireTaxonomies();
        throw notFound();
      }
      return await catalog(context, "Produtos para " + brand.name, brand.id);
    }
    if (/^\/(produtos|capota-para-picape)\/[^/]+\/$/.test(path)) {
      requireTaxonomies();
      const slug = path.split("/")[2];
      const category =
        path.startsWith("/produtos/") &&
        base.tax.categories.find((c) => c.slug === slug);
      return category
        ? await catalog(context, category.name, undefined, category.id)
        : await product(context, slug);
    }
    if (path === "/blog/") return await blog(base);
    if (path === "/trabalhos/") return await works(base);
    const match = path.match(/^\/(blog|trabalhos)\/([^/]+)\/$/);
    if (match)
      return await (match[1] === "blog" ? article : work)(base, match[2]);
    if (
      path.startsWith("/venda-de-capota-para-picape-em-") &&
      path.split("/").length === 3
    ) {
      const post = await cityBySlug(
        path.slice(1, -1).replace("venda-de-capota-para-picape-em-", ""),
      );
      if (!post) throw notFound();
      return {
        ...base,
        kind: "city",
        title:
          "Capota para picape em " +
          post.name +
          (post.acf?.estado ? "/" + post.acf.estado : ""),
        post,
      };
    }
    if (path.split("/").length === 3) {
      const post = await pageBySlug(path.slice(1, -1));
      if (post) return { ...base, kind: "page", title: post.name, post };
    }
    throw notFound();
  } catch (error) {
    if (
      error instanceof CmsError &&
      error.code === "rest_post_invalid_page_number"
    )
      throw notFound();
    throw error;
  }
}

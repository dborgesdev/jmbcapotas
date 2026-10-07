import { notFound } from "@tanstack/react-router";
import { posts, postBySlug } from "../wordpress/posts";
import { linkedProducts } from "../wordpress/products";
import { terms } from "../wordpress/taxonomies";
import type { SiteData } from "./types";
export async function blog(base: SiteData) {
  const s = base.search;
  return {
    ...base,
    kind: "blog",
    title: "Na estrada com a JMB",
    list: await posts({
      page: s.pagina || 1,
      search: s.q || "",
      ...(s.blogCategoria ? { categories: s.blogCategoria } : {}),
    }),
    blogCategories: await terms("categories").catch(() => []),
  };
}
export async function article(base: SiteData, slug: string) {
  const post = await postBySlug(slug);
  if (!post) throw notFound();
  return {
    ...base,
    kind: "article",
    title: post.name,
    post,
    related: await linkedProducts(post, base.tax.categories),
  };
}

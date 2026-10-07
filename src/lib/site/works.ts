import { notFound } from "@tanstack/react-router";
import { works as getWorks, workBySlug } from "../wordpress/works";
import { linkedProducts } from "../wordpress/products";

import type { SiteData } from "./types";
export async function works(base: SiteData) {
  const s = base.search;
  return {
    ...base,
    kind: "works",
    title: "Trabalhos que ganham a estrada",
    list: await getWorks({
      page: s.pagina || 1,
      search: s.q || "",
      ...(s.blogCategoria ? { categories: s.blogCategoria } : {}),
    }),
    blogCategories: [],
  };
}
export async function work(base: SiteData, slug: string) {
  const post = await workBySlug(slug);
  if (!post) throw notFound();
  return {
    ...base,
    kind: "work",
    title: post.name,
    post,
    related: await linkedProducts(post, base.tax.categories),
  };
}

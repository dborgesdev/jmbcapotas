import { notFound } from "@tanstack/react-router";
import { pageBySlug } from "../wordpress/pages";
import { recentWorks } from "./works";
import type { SiteData } from "./types";

export async function page(base: SiteData, slug: string): Promise<SiteData> {
  const post =
    base.pages.find((p) => p.slug === slug) || (await pageBySlug(slug));
  if (!post) throw notFound();
  return {
    ...base,
    kind: "page",
    title: post.name,
    post,
    ...(post.slug === "conserto-de-capotas-de-fibra"
      ? { works: await recentWorks() }
      : {}),
  };
}

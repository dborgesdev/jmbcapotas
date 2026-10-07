import { notFound, redirect } from "@tanstack/react-router";
import { productBySlug, relatedProducts } from "../wordpress/products";
import type { SiteContext } from "./context";
export async function product(
  { base, requireTaxonomies }: SiteContext,
  slug: string,
) {
  requireTaxonomies();
  const post = await productBySlug(slug, base.tax.categories);
  if (!post) throw notFound();
  if (post.url !== base.path)
    throw redirect({
      to: "/$/",
      params: { _splat: post.url.slice(1, -1) },
      statusCode: 301,
    });
  return {
    ...base,
    kind: "product",
    title: post.name,
    post,
    related: await relatedProducts(post, base.tax.categories),
  };
}

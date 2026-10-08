import { notFound, redirect } from "@tanstack/react-router";
import { postBySlug } from "../wordpress/posts";
import { productBySlug } from "../wordpress/products";
import { legacyProductSlugs } from "./legacy-product-map";
import type { Term } from "../wordpress/types";

/**
 * Legacy routes from the former WordPress installation.
 * Keep rules centralized and only redirect to verified canonical entities.
 */
export async function legacyRedirect(path: string, categories: Term[]) {
  // Historical taxonomy archives have no equivalent archive in the new site.
  if (/^\/(tag|tags|category|categoria|categorias)\/(?:[^/]+\/)*$/.test(path)) {
    throw redirect({ to: "/produtos/", statusCode: 301 });
  }

  const article = path.match(/^\/venda-de-capota\/([^/]+)\/$/);
  if (article) {
    const post = await postBySlug(article[1]);
    if (post) {
      throw redirect({
        to: "/$/",
        params: { _splat: post.url.slice(1, -1) },
        statusCode: 301,
      });
    }
  }

  const oldProduct = path.match(/^\/capota-para-picapes\/([^/]+)\/$/);
  if (oldProduct) {
    const slug = legacyProductSlugs[oldProduct[1]] ?? oldProduct[1];
    const product = await productBySlug(slug, categories);
    if (product) {
      throw redirect({
        to: "/$/",
        params: { _splat: product.url.slice(1, -1) },
        statusCode: 301,
      });
    }
    // Sem equivalência publicada, devolver 404 real em vez de redirect genérico.
    throw notFound();
  }
}

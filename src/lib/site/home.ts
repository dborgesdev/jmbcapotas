import { products } from "../wordpress/products";
import { posts } from "../wordpress/posts";
import { works } from "../wordpress/works";
import { clients } from "../wordpress/clients";
import type { SiteContext } from "./context";
export async function home({ base, taxUnavailable }: SiteContext) {
  const results = await Promise.allSettled([
    works({ per_page: 3 }),
    posts({ per_page: 3 }),
    products({ per_page: 1 }, base.tax.categories),
    clients(),
  ]);
  return {
    ...base,
    kind: "home",
    title: "Produtos para acompanhar seu caminho",
    works: results[0].status === "fulfilled" ? results[0].value.items : [],
    posts: results[1].status === "fulfilled" ? results[1].value.items : [],
    clients: results[3].status === "fulfilled" ? results[3].value : [],
    post:
      results[2].status === "fulfilled" ? results[2].value.items[0] : undefined,
    ...(taxUnavailable
      ? {
          error:
            "As marcas estão temporariamente indisponíveis. Fale com nossa equipe.",
        }
      : {}),
  };
}

import { taxonomies } from "../wordpress/taxonomies";
import { pages } from "../wordpress/pages";
import { cities } from "../wordpress/cities";
import type { Search, SiteData } from "./types";
export async function siteContext(path: string, search: Search) {
  const [taxResult, pagesResult, citiesResult] = await Promise.allSettled([
    taxonomies(),
    pages({ per_page: 100 }),
    cities({ per_page: 100 }),
  ]);
  const base: SiteData = {
    kind: "",
    title: "",
    path,
    tax:
      taxResult.status === "fulfilled"
        ? taxResult.value
        : { brands: [], models: [], categories: [] },
    pages: pagesResult.status === "fulfilled" ? pagesResult.value.items : [],
    cities: citiesResult.status === "fulfilled" ? citiesResult.value.items : [],
    search,
  };
  return {
    base,
    requireTaxonomies: () => {
      if (taxResult.status === "rejected") throw taxResult.reason;
    },
    taxUnavailable: taxResult.status === "rejected",
  };
}
export type SiteContext = Awaited<ReturnType<typeof siteContext>>;

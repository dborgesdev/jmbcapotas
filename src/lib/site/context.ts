import { taxonomies } from "../wordpress/taxonomies";
import { pages } from "../wordpress/pages";
import { cities } from "../wordpress/cities";
import type { Search, SiteData } from "./types";

async function allPublished<T>(fetchPage: (page: number) => Promise<{ items: T[]; pages: number }>): Promise<T[]> {
  const first = await fetchPage(1);
  const items = [...first.items];
  for (let page = 2; page <= first.pages; page++) {
    items.push(...(await fetchPage(page)).items);
  }
  return items;
}
export async function siteContext(path: string, search: Search) {
  const [taxResult, pagesResult, citiesResult] = await Promise.allSettled([
    taxonomies(),
    allPublished((page) => pages({ per_page: 100, page })),
    allPublished((page) => cities({ per_page: 100, page })),
  ]);
  const base: SiteData = {
    kind: "",
    title: "",
    path,
    tax:
      taxResult.status === "fulfilled"
        ? taxResult.value
        : { brands: [], models: [], categories: [] },
    pages: pagesResult.status === "fulfilled" ? pagesResult.value : [],
    cities: citiesResult.status === "fulfilled" ? citiesResult.value : [],
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

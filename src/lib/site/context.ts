import { cityLinks } from "../wordpress/cities";
import { allPublished, globalContext } from "./global-context";
import type { Search, SiteData } from "./types";

export async function siteContext(path: string, search: Search) {
  const globals = await globalContext();
  // Full city metadata belongs only to the city index, never to the shared snapshot.
  const cities =
    path === "/cidades/"
      ? await allPublished((page) => cityLinks({ per_page: 100, page })).catch(
          () => [],
        )
      : globals.cities;
  const base: SiteData = {
    config: globals.config,
    kind: "",
    title: "",
    path,
    tax: globals.tax,
    pages: globals.pages,
    cities,
    search: { ...search },
  };
  return {
    base,
    requireTaxonomies: () => {
      if (globals.taxUnavailable) throw globals.taxError;
    },
    taxUnavailable: globals.taxUnavailable,
  };
}
export type SiteContext = Awaited<ReturnType<typeof siteContext>>;

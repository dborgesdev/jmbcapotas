import { taxonomies } from "../wordpress/taxonomies";
import { pages } from "../wordpress/pages";
import { footerCities } from "../wordpress/cities";
import { siteConfig } from "../wordpress/site-config";

// One public snapshot per isolate; no route, query or visitor keys.
export const GLOBAL_CONTEXT_TTL_MS = 60_000;
const RETRY_TTL_MS = 10_000;
async function loadGlobals() {
  const [taxResult, pagesResult, citiesResult, configResult] =
    await Promise.allSettled([
      taxonomies(),
      allPublished((page) => pages({ per_page: 100, page })),
      footerCities(),
      siteConfig(),
    ]);
  return {
    tax:
      taxResult.status === "fulfilled"
        ? taxResult.value
        : { brands: [], models: [], categories: [] },
    pages: pagesResult.status === "fulfilled" ? pagesResult.value : [],
    cities: citiesResult.status === "fulfilled" ? citiesResult.value : [],
    config: configResult.status === "fulfilled" ? configResult.value : {},
    taxUnavailable: taxResult.status === "rejected",
    taxError: taxResult.status === "rejected" ? taxResult.reason : undefined,
    degraded:
      (configResult.status === "fulfilled" &&
        !Object.keys(configResult.value).length) ||
      [taxResult, pagesResult, citiesResult, configResult].some(
        (result) => result.status === "rejected",
      ),
  };
}
export async function allPublished<T>(
  fetchPage: (page: number) => Promise<{ items: T[]; pages: number }>,
): Promise<T[]> {
  const first = await fetchPage(1);
  const items = [...first.items];
  for (let page = 2; page <= first.pages; page++)
    items.push(...(await fetchPage(page)).items);
  return items;
}
type Globals = Awaited<ReturnType<typeof loadGlobals>>;
let cached: Globals | undefined;
let expires = 0;
let pending: Promise<Globals> | undefined;
export function globalContext(): Promise<Globals> {
  if (cached && expires > Date.now()) return Promise.resolve(cached);
  if (pending) return pending;
  // Drop the expired snapshot while refreshing rather than retaining generations.
  cached = undefined;
  pending = loadGlobals()
    .then((value) => {
      cached = value;
      expires =
        Date.now() + (value.degraded ? RETRY_TTL_MS : GLOBAL_CONTEXT_TTL_MS);
      return value;
    })
    .finally(() => {
      pending = undefined;
    });
  return pending;
}

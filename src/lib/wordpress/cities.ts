import { all, request } from "./client";
import { collection, type QueryParams } from "./query";
import type { RawPost } from "./types";
import { cityUrl as publicCityUrl } from "../paths";
import { clean } from "./html";
export type CityLink = Pick<RawPost, "id" | "slug"> & {
  name: string;
  url: string;
  acf?: { estado?: string };
};
export const cityUrl = (p: Pick<RawPost, "slug">) => publicCityUrl(p.slug);
export const cities = (params: QueryParams = {}) =>
  collection("cidade", cityUrl, params);
export async function cityLinks(params: QueryParams = {}) {
  const query = new URLSearchParams({
    per_page: "100",
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ),
    _fields: "id,slug,title,acf",
  });
  const result = await request<
    Pick<RawPost, "id" | "slug" | "title" | "acf">[]
  >(`cidade?${query}`);
  const items: CityLink[] = result.data.map((city) => ({
    id: city.id,
    slug: city.slug,
    name: clean(city.title.rendered),
    url: cityUrl(city),
    acf: { estado: city.acf?.estado },
  }));
  return { items, total: result.total, pages: result.pages };
}
// The footer uses only the first four records returned by the CMS.
export const footerCities = async () =>
  (await cityLinks({ per_page: 4, page: 1 })).items.slice(0, 4);
export const cityBySlug = async (slug: string) =>
  (await cities({ slug })).items[0];
export const allCities = () => all<RawPost>("cidade");

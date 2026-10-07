import { all } from "./client";
import { collection, type QueryParams } from "./query";
import type { RawPost } from "./types";
import { cityUrl as publicCityUrl } from "../paths";
export const cityUrl = (p: Pick<RawPost, "slug">) => publicCityUrl(p.slug);
export const cities = (params: QueryParams = {}) =>
  collection("cidade", cityUrl, params);
export const cityBySlug = async (slug: string) =>
  (await cities({ slug })).items[0];
export const allCities = () => all<RawPost>("cidade");

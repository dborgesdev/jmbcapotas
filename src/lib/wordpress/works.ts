import { all } from "./client";
import { collection, type QueryParams } from "./query";
import type { RawPost } from "./types";

export const workUrl = (p: Pick<RawPost, "slug">) => `/trabalhos/${p.slug}/`;
export const works = (params: QueryParams = {}) =>
  collection("trabalho", workUrl, params);
export const workBySlug = async (slug: string) =>
  (await works({ slug })).items[0];
export const allWorks = () => all<RawPost>("trabalho");

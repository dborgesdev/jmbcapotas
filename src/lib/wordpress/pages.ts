import { all } from "./client";
import { collection, type QueryParams } from "./query";
import type { RawPost } from "./types";

export const pageUrl = (p: Pick<RawPost, "slug">) => `/${p.slug}/`;
export const pages = (params: QueryParams = {}) =>
  collection("pages", pageUrl, params);
export const pageBySlug = async (slug: string) =>
  (await pages({ slug })).items[0];
export const allPages = () => all<RawPost>("pages");

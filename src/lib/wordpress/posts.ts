import { all } from "./client";
import { collection, type QueryParams } from "./query";
import type { RawPost } from "./types";

export const postUrl = (p: Pick<RawPost, "slug">) => `/blog/${p.slug}/`;
export const posts = (params: QueryParams = {}) =>
  collection("posts", postUrl, params);
export const postBySlug = async (slug: string) =>
  (await posts({ slug })).items[0];
export const allPosts = () => all<RawPost>("posts");

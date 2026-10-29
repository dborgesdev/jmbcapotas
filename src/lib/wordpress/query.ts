import { request } from "./client";
import { normalizePost, postMediaReferences } from "./normalize";
import { mediaBatch } from "./media";
import type { Collection, Post, RawPost } from "./types";
export type QueryParams = Record<string, string | number>;
export async function collection(
  endpoint: string,
  publicUrl: (post: RawPost) => string,
  params: Record<string, string | number> = {},
): Promise<Collection<Post>> {
  const query = new URLSearchParams({
    per_page: "12",
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => v !== "")
        .map(([k, v]) => [k, String(v)]),
    ),
    _embed: "wp:featuredmedia",
  });
  const result = await request<RawPost[]>(`${endpoint}?${query}`);
  const visible = result.data;
  const images = await mediaBatch(visible.flatMap(postMediaReferences));
  return {
    items: await Promise.all(
      visible.map((p) => normalizePost(p, publicUrl(p), images)),
    ),
    total: result.total,
    pages: result.pages,
  };
}

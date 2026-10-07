import { request } from "./client";
import { normalizePost } from "./normalize";
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
  });
  const result = await request<RawPost[]>(`${endpoint}?${query}`);
  return {
    items: await Promise.all(
      result.data.map((p) => normalizePost(p, publicUrl(p))),
    ),
    total: result.total,
    pages: result.pages,
  };
}

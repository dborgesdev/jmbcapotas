import { request } from "./client";
import { clean } from "./html";
import type { Media } from "./types";
type RawMedia = {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes?: Record<string, { source_url: string; width: number }>;
  };
};
export async function media(id: unknown): Promise<Media | undefined> {
  if (!Number(id)) return undefined;
  try {
    const { data: m } = await request<RawMedia>(`media/${Number(id)}`);
    return {
      id: m.id,
      url: m.source_url,
      alt: clean(m.alt_text || ""),
      width: m.media_details.width,
      height: m.media_details.height,
      srcSet: Object.values(m.media_details.sizes || {})
        .filter((s) => s.width > 200)
        .map((s) => `${s.source_url} ${s.width}w`)
        .join(", "),
    };
  } catch {
    return undefined;
  }
}

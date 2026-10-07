import { clean, safeHtml } from "./html";
import { media } from "./media";
import type { RawPost, Post, Media } from "./types";
export async function normalizePost(p: RawPost, url: string): Promise<Post> {
  const ids = [
    ...new Set(
      [p.featured_media, ...Object.values(p.acf?.galeria || {})]
        .map(Number)
        .filter(Boolean),
    ),
  ];
  const images = (await Promise.all(ids.map(media))).filter(
    (m): m is Media => !!m,
  );
  return {
    ...p,
    name: clean(p.title.rendered),
    html: safeHtml(p.content.rendered),
    summary: clean(p.content.rendered).slice(0, 170),
    images,
    url,
  };
}

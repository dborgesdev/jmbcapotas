import { postContent } from "./post-content";
import { media, mediaId, mediaBatch, type MediaLookup } from "./media";
import type { RawPost, Post, Media } from "./types";
export function postMediaReferences(p: RawPost): unknown[] {
  return [
    p._embedded?.["wp:featuredmedia"]?.[0] || p.featured_media,
    ...Object.values(p.acf?.galeria || {}),
  ];
}
export async function normalizePost(
  p: RawPost,
  url: string,
  lookup?: MediaLookup,
): Promise<Post> {
  const resolved = lookup || (await mediaBatch(postMediaReferences(p)));
  const slots = [
    {
      value: p.featured_media,
      resolved:
        p._embedded?.["wp:featuredmedia"]?.[0] ??
        resolved.get(mediaId(p.featured_media)),
    },
    ...Object.values(p.acf?.galeria || {}).map((value) => ({
      value,
      resolved: resolved.get(mediaId(value)),
    })),
  ];
  // Preserve explicit null (deleted image) and select the best representation for repeated IDs.
  const unique = new Map<number, (typeof slots)[number]>();
  for (const slot of slots) {
    const id = mediaId(slot.value);
    if (
      id &&
      (!unique.has(id) ||
        (unique.get(id)?.resolved === undefined && slot.resolved !== undefined))
    )
      unique.set(id, slot);
  }
  const images = (
    await Promise.all(
      [...unique.values()].map((s) => media(s.value, s.resolved)),
    )
  ).filter((m): m is Media => !!m);
  return {
    id: p.id,
    slug: p.slug,
    date: p.date,
    modified: p.modified,
    featured_media: p.featured_media,
    categoria_produto: p.categoria_produto,
    marca: p.marca,
    modelo: p.modelo,
    categories: p.categories,
    acf: p.acf,
    ...postContent(p),
    images,
    url,
  };
}

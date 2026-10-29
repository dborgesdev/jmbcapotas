import { request } from "./client";
import { clean } from "./html";
import type { Media } from "./types";
export type RawMedia = {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes?: Record<string, { source_url: string; width: number }>;
  };
};
export function mediaId(value: unknown): number {
  const raw =
    value && typeof value === "object"
      ? ((value as Record<string, unknown>).id ??
        (value as Record<string, unknown>).ID)
      : value;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : 0;
}
export function resolvedMedia(value: unknown): Media | undefined {
  if (!value || typeof value !== "object") return;
  const m = value as Record<string, unknown>;
  const details = (m.media_details || m) as Record<string, unknown>;
  const url = m.url || m.source_url;
  if (
    !mediaId(m) ||
    typeof url !== "string" ||
    !/^https?:\/\//.test(url) ||
    !(Number(details.width) > 0) ||
    !(Number(details.height) > 0)
  )
    return;
  const sizes = details.sizes as RawMedia["media_details"]["sizes"];
  const candidates = Object.entries(sizes || {}).flatMap(([name, size]) => {
    if (typeof size === "string") {
      const width = Number((sizes as Record<string, unknown>)[`${name}-width`]);
      return width > 200 ? [`${size} ${width}w`] : [];
    }
    return size && size.width > 200 && typeof size.source_url === "string"
      ? [`${size.source_url} ${size.width}w`]
      : [];
  });
  // ACF standard image arrays omit the full-size candidate from sizes.
  if (
    !m.media_details &&
    typeof m.srcSet !== "string" &&
    Number(details.width) > 200
  )
    candidates.push(`${url} ${details.width}w`);
  return {
    id: mediaId(m),
    url,
    alt: clean(String(m.alt ?? m.alt_text ?? "")),
    width: Number(details.width),
    height: Number(details.height),
    srcSet: typeof m.srcSet === "string" ? m.srcSet : candidates.join(", "),
  };
}
export async function media(
  value: unknown,
  resolved?: unknown,
): Promise<Media | undefined> {
  // Explicit null means the native collection confirmed the attachment is absent.
  if (resolved === null) return;
  const supplied = resolvedMedia(resolved) || resolvedMedia(value);
  const id = mediaId(value) || mediaId(resolved);
  if (supplied && (!id || supplied.id === id)) return supplied;
  if (!id) return undefined;
  try {
    const { data: m } = await request<RawMedia>(`media/${id}`);
    return resolvedMedia(m);
  } catch {
    return undefined;
  }
}

export type MediaLookup = Map<number, Media | null>;
/** Resolve only unresolved IDs, at most 100 per native REST collection request. */
export async function mediaBatch(values: unknown[]): Promise<MediaLookup> {
  const result: MediaLookup = new Map();
  for (const value of values) {
    const resolved = resolvedMedia(value);
    if (resolved) result.set(resolved.id, resolved);
  }
  const ids = [
    ...new Set(values.map(mediaId).filter((id) => id && !result.has(id))),
  ].sort((a, b) => a - b);
  // Single IDs retain the transport's existing individual cache and fallback.
  if (ids.length < 2) return result;
  for (let offset = 0; offset < ids.length; offset += 100) {
    const chunk = ids.slice(offset, offset + 100);
    try {
      const query = new URLSearchParams({
        include: chunk.join(","),
        per_page: "100",
        _fields: "id,source_url,alt_text,media_details",
      });
      const { data } = await request<RawMedia[]>(`media?${query}`);
      if (!Array.isArray(data)) continue;
      for (const id of chunk) {
        const item = data.find((m) => m.id === id);
        // Missing IDs are authoritative; malformed entries retain individual fallback.
        if (!item) result.set(id, null);
        else {
          const resolved = resolvedMedia(item);
          if (resolved) result.set(id, resolved);
        }
      }
    } catch {
      /* Legacy individual lookup remains available after a batch failure. */
    }
  }
  return result;
}

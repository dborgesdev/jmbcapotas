import { all } from "./client";
import { clean } from "./html";
import { media } from "./media";
import type { Media } from "./types";
export type Client = { id: number; name: string; logo?: Media };
type RawClient = {
  id: number;
  title: { rendered: string };
  featured_media: number;
};
export async function clients(): Promise<Client[]> {
  const entries = await all<RawClient>("cliente");
  return Promise.all(
    entries.map(async (entry) => ({
      id: entry.id,
      name: clean(entry.title.rendered),
      logo: await media(entry.featured_media),
    })),
  );
}

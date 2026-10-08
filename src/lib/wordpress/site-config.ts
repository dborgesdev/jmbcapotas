import { request } from "./client";
import { media } from "./media";
import type { Media } from "./types";
import { brazilianPhone } from "../contacts";
import { paymentConditions } from "../payment";

export type SiteConfig = {
  hero?: Media;
  finalCta?: Media;
  telephone?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  address?: string;
  maps?: string;
  payment?: string;
};
export function externalUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return;
  try {
    const url = new URL(value.trim());
    if (["https:", "http:"].includes(url.protocol)) return url.href;
  } catch {
    /* Invalid optional URL. */
  }
}
export async function normalizeSiteConfig(
  acf: Record<string, unknown>,
): Promise<SiteConfig> {
  const ids = [acf.hero, acf.final_cta].map((id) =>
    (typeof id === "number" || typeof id === "string") &&
    Number.isSafeInteger(Number(id)) &&
    Number(id) > 0
      ? Number(id)
      : 0,
  );
  const images = new Map(
    await Promise.all(
      [...new Set(ids)]
        .filter(Boolean)
        .map(async (id) => [id, await media(id)] as const),
    ),
  );
  const email = typeof acf.email === "string" ? acf.email.trim() : "";
  return {
    hero: images.get(ids[0]),
    finalCta: images.get(ids[1]),
    telephone: brazilianPhone(acf.telefone),
    whatsapp: brazilianPhone(acf.whatsapp),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
    instagram: externalUrl(acf.instagram),
    facebook: externalUrl(acf.facebook),
    address:
      typeof acf.endereco === "string"
        ? acf.endereco.trim() || undefined
        : undefined,
    maps: externalUrl(acf.maps),
    payment: paymentConditions(acf.parcelamento, acf.sem_juros),
  };
}
async function fetchSiteConfig(): Promise<SiteConfig> {
  try {
    const { data } = await request<
      { slug: string; acf?: Record<string, unknown> }[]
    >("site-config?slug=jmb-capotas&status=publish&per_page=1");
    return await normalizeSiteConfig(
      data.find((record) => record.slug === "jmb-capotas")?.acf || {},
    );
  } catch {
    return {};
  }
}
let cached: SiteConfig | undefined;
let expires = 0;
let pending: Promise<SiteConfig> | undefined;
export function siteConfig(): Promise<SiteConfig> {
  if (cached && expires > Date.now()) return Promise.resolve(cached);
  if (pending) return pending;
  pending = fetchSiteConfig()
    .then((config) => {
      cached = config;
      expires = Date.now() + (Object.keys(config).length ? 60000 : 10000);
      return config;
    })
    .finally(() => {
      pending = undefined;
    });
  return pending;
}

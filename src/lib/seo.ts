import { SITE } from "./config";
import type { SiteData } from "./site/types";
export function seo(d: SiteData) {
  const title = `${d.title} | JMB Capotas`;
  const description =
    d.post?.summary ||
    "Encontre produtos para seu veículo. Navegue por marcas, modelos e categorias e fale com a JMB Capotas pelo WhatsApp.";
  const canonical = `${SITE}${d.path}`;
  const specific = d.kind === "home" ? undefined : d.post?.images[0]?.url;
  const image = specific
    ? new URL(specific, SITE).href
    : `${SITE}/og-image.webp`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
      {
        property: "og:type",
        content: d.kind === "article" ? "article" : "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(image
        ? [
            { property: "og:image", content: image },
            { name: "twitter:image", content: image },
          ]
        : []),
      ...(d.kind === "404" ||
      Object.entries(d.search).some(([key, value]) =>
        key === "pagina" ? Number(value) > 1 : Boolean(value),
      )
        ? [{ name: "robots", content: "noindex,follow" }]
        : []),
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}

import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "../lib/config";
import { all } from "../lib/wordpress/client";
import {
  taxonomies,
  productUrl,
  brandUrl,
  cityUrl,
} from "../lib/wordpress/content";
import type { RawPost } from "../lib/wordpress/types";
function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const [tax, products, pages, cities, posts, works] =
            await Promise.all([
              taxonomies(),
              all<RawPost>("produto"),
              all<RawPost>("pages"),
              all<RawPost>("cidade"),
              all<RawPost>("posts"),
              all<RawPost>("trabalho"),
            ]);
          const urls = [
            "/",
            "/produtos/",
            "/pronta-entrega/",
            "/trabalhos/",
            "/blog/",
            "/cidades/",
            ...tax.brands.map(brandUrl),
            ...tax.categories.map((c) => `/produtos/${c.slug}/`),
            ...products.map((p) => productUrl(p, tax.categories)),
            ...pages.map((p) => `/${p.slug}/`),
            ...cities.map((p) => cityUrl(p.slug)),
            ...posts.map((p) => `/blog/${p.slug}/`),
            ...works.map((p) => `/trabalhos/${p.slug}/`),
          ];
          return new Response(
            `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(urls)].map((p) => `<url><loc>${escape(SITE + p)}</loc></url>`).join("")}</urlset>`,
            {
              headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=300",
              },
            },
          );
        } catch {
          return new Response("Sitemap temporariamente indisponível", {
            status: 503,
            headers: { "Retry-After": "60" },
          });
        }
      },
    },
  },
});

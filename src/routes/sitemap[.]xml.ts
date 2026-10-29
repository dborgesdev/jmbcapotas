import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "../lib/config";
import { sitemapUrls } from "../lib/wordpress/sitemap";

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const urls = await sitemapUrls();
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

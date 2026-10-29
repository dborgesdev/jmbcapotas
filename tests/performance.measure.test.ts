import { it, vi } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import type { Post } from "../src/lib/wordpress/types";
import type { SiteData } from "../src/lib/site/types";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteView } from "../src/components/site";

// Same hook shim used by the approved static-markup regression suite.
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => vi.fn(),
}));

function contentFingerprint(data: SiteData) {
  const post = (p?: Post) =>
    p && {
      id: p.id,
      url: p.url,
      name: p.name,
      html: p.html,
      summary: p.summary,
      images: p.images,
    };
  return createHash("sha256")
    .update(
      JSON.stringify({
        kind: data.kind,
        title: data.title,
        config: data.config,
        tax: data.tax,
        pages: data.pages.map(post),
        cities: (data.kind === "cities"
          ? data.cities
          : data.cities.slice(0, 4)
        ).map((city) => ({
          id: city.id,
          name: city.name,
          url: city.url,
          estado: city.acf?.estado,
        })),
        post: post(data.post),
        list: data.list && { ...data.list, items: data.list.items.map(post) },
        related: data.related?.map(post),
        works: data.works?.map(post),
        posts: data.posts?.map(post),
        clients: data.clients,
      }),
    )
    .digest("hex");
}

// Opt-in real-origin measurement; never runs in the normal test suite.
it.skipIf(!process.env.MEASURE_REST)(
  "measures real loaders cold and warm",
  async () => {
    const paths = [
      "",
      "produtos",
      "produtos/capota-de-fibra",
      "marcas/capota-de-fibra-para-fiat",
      "capota-para-picape/capota-de-fibra-com-portas-laterais-para-fiat-strada",
      "pronta-entrega",
      "trabalhos",
      "trabalhos/instalacao-capota-de-fibra-empresa-xyz",
      "blog",
      "blog/jmb-capotas-apresenta-nova-ram-2500-rodeo-edition",
      "quem-somos",
      "conserto-de-capotas-de-fibra",
      "cidades",
    ];
    const original = globalThis.fetch;
    const rows = [];
    const source = process.env.MEASURE_BASELINE
      ? "../artifacts/rest-baseline/src"
      : "../src";
    for (const path of paths) {
      vi.resetModules();
      const { resolveRoute } = await import(
        `${source}/lib/site/resolve-route.ts`
      );
      const { observeRest } = await import(`${source}/lib/wordpress/client.ts`);
      for (const cache of ["cold", "warm"]) {
        const events: { path: string; source: string }[] = [];
        observeRest((event: { path: string; source: string }) =>
          events.push(event),
        );
        const calls: {
          endpoint: string;
          ms: number;
          status?: number;
          error?: string;
          bytes?: number;
        }[] = [];
        vi.stubGlobal("fetch", async (input: string, init: RequestInit) => {
          const start = performance.now();
          const endpoint = new URL(input);
          endpoint.searchParams.sort();
          try {
            const response = await original(input, init);
            const body = await response.text();
            calls.push({
              endpoint: endpoint.pathname + endpoint.search,
              ms: Math.round(performance.now() - start),
              status: response.status,
              bytes: Buffer.byteLength(body),
            });
            return new Response(body, {
              status: response.status,
              headers: response.headers,
            });
          } catch (error) {
            calls.push({
              endpoint: endpoint.pathname + endpoint.search,
              ms: Math.round(performance.now() - start),
              error: String(error),
            });
            throw error;
          }
        });
        const start = performance.now();
        try {
          const result = await resolveRoute({ path, search: {} });
          const dataMs = Math.round(performance.now() - start);
          const renderStart = performance.now();
          const html = renderToStaticMarkup(
            createElement(SiteView, { data: result }),
          );
          const componentSsrMs = Number(
            (performance.now() - renderStart).toFixed(2),
          );
          rows.push({
            path,
            cache,
            kind: result.kind,
            contentFingerprint: contentFingerprint(result),
            htmlFingerprint: createHash("sha256").update(html).digest("hex"),
            ms: dataMs,
            componentSsrMs,
            http: calls.length,
            hits: events.filter((e) => e.source === "cache").length,
            deduplications: events.filter((e) => e.source === "pending").length,
            media: calls.filter((c) => /\/media\/\d+/.test(c.endpoint)).length,
            bytes: calls.reduce((sum, call) => sum + (call.bytes || 0), 0),
            calls,
          });
        } catch (error) {
          rows.push({ path, cache, error: String(error), calls });
        }
        vi.unstubAllGlobals();
      }
    }
    mkdirSync("docs/performance", { recursive: true });
    writeFileSync(
      `docs/performance/${process.env.MEASURE_REST}.json`,
      JSON.stringify(rows, null, 2),
    );
  },
  600000,
);

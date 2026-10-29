import { existsSync, readFileSync } from "node:fs";

export function createReplay({
  delayMs = 5,
  failEndpoint,
  onCall = () => {},
} = {}) {
  const corpus = JSON.parse(
    readFileSync("artifacts/worker-audit/corpus.json", "utf8"),
  );
  const media = new Map(corpus.endpoints.media.map((item) => [item.id, item]));
  const footer =
    corpus.footerCities ||
    (existsSync("artifacts/worker-audit/footer-cities.json")
      ? JSON.parse(
          readFileSync("artifacts/worker-audit/footer-cities.json", "utf8"),
        )
      : undefined);
  return async (request) => {
    const url = new URL(request.url);
    if (url.hostname !== "painel.jmbcapotas.com.br")
      throw new Error(`Unexpected outbound host: ${url.hostname}`);
    const [endpoint, single] = url.pathname
      .replace("/wp-json/wp/v2/", "")
      .split("/");
    const params = url.searchParams;
    const started = performance.now();
    const event = {
      endpoint: single ? "media/{id}" : endpoint,
      query: url.search,
      status: null,
      bytes: 0,
      waitMs: 0,
    };
    // Count a real outbound attempt when it starts, even if a redirect cancels it.
    onCall(event);
    const complete = (details) => Object.assign(event, details);
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
    if (endpoint === failEndpoint) {
      complete({
        endpoint,
        status: 503,
        bytes: 2,
        waitMs: performance.now() - started,
      });
      return new Response("{}", { status: 503 });
    }
    let items = [...(corpus.endpoints[endpoint] || [])];
    if (endpoint === "cidade" && params.get("per_page") === "4" && footer)
      items = [
        ...footer,
        ...items.filter((item) => !footer.some((city) => city.id === item.id)),
      ];
    const ids = (key) =>
      (params.get(key) || "").split(",").filter(Boolean).map(Number);
    if (single) {
      const value = media.get(Number(single));
      const body = JSON.stringify(value || { code: "rest_post_invalid_id" });
      complete({
        endpoint: "media/{id}",
        status: value ? 200 : 404,
        bytes: Buffer.byteLength(body),
        waitMs: performance.now() - started,
      });
      return new Response(body, {
        status: value ? 200 : 404,
        headers: { "content-type": "application/json" },
      });
    }
    if (params.has("slug"))
      items = items.filter((item) => item.slug === params.get("slug"));
    if (params.has("include"))
      items = items.filter((item) => ids("include").includes(item.id));
    if (params.has("exclude"))
      items = items.filter((item) => !ids("exclude").includes(item.id));
    for (const key of ["marca", "modelo", "categoria_produto", "categories"]) {
      if (params.has(key))
        items = items.filter((item) =>
          item[key]?.some((id) => ids(key).includes(id)),
        );
      if (params.has(`${key}_exclude`))
        items = items.filter(
          (item) =>
            !item[key]?.some((id) => ids(`${key}_exclude`).includes(id)),
        );
    }
    if (params.get("search")) {
      const search = params.get("search").toLocaleLowerCase("pt-BR");
      items = items.filter((item) =>
        `${item.title?.rendered || ""} ${item.content?.rendered || ""}`
          .toLocaleLowerCase("pt-BR")
          .includes(search),
      );
    }
    const total = items.length,
      perPage = Number(params.get("per_page") || 10),
      page = Number(params.get("page") || 1);
    const pages = Math.ceil(total / perPage);
    if (page > Math.max(1, pages)) {
      complete({
        endpoint,
        status: 400,
        bytes: 46,
        waitMs: performance.now() - started,
      });
      return Response.json(
        { code: "rest_post_invalid_page_number" },
        { status: 400 },
      );
    }
    items = items.slice((page - 1) * perPage, page * perPage);
    if (params.has("_embed"))
      items = items.map((item) => ({
        ...item,
        ...(media.has(item.featured_media)
          ? {
              _embedded: {
                "wp:featuredmedia": [media.get(item.featured_media)],
              },
            }
          : {}),
      }));
    if (params.has("_fields"))
      items = items.map((item) =>
        Object.fromEntries(
          params
            .get("_fields")
            .split(",")
            .filter((key) => key in item)
            .map((key) => [key, item[key]]),
        ),
      );
    const body = JSON.stringify(items);
    complete({
      endpoint,
      status: 200,
      bytes: Buffer.byteLength(body),
      waitMs: performance.now() - started,
    });
    return new Response(body, {
      headers: {
        "content-type": "application/json",
        "x-wp-total": String(total),
        "x-wp-totalpages": String(pages),
      },
    });
  };
}

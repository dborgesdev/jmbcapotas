import { mkdirSync, writeFileSync } from "node:fs";

// One sequential, read-only capture. All runtime repetitions use this local file.
const base = "https://painel.jmbcapotas.com.br/wp-json/wp/v2/";
const corpus = {
  capturedAt: new Date().toISOString(),
  endpoints: {},
  requests: [],
};
for (const endpoint of [
  "produto",
  "trabalho",
  "cliente",
  "marca",
  "modelo",
  "categoria_produto",
  "site-config",
  "pages",
  "posts",
  "cidade",
  "categories",
]) {
  const items = [];
  let pages = 1;
  for (let page = 1; page <= pages; page++) {
    const url = `${base}${endpoint}?per_page=100&page=${page}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`${response.status}: ${endpoint}`);
    const text = await response.text();
    pages = Number(response.headers.get("x-wp-totalpages") || 1);
    items.push(...JSON.parse(text));
    corpus.requests.push({ endpoint, page, bytes: Buffer.byteLength(text) });
  }
  corpus.endpoints[endpoint] = items;
}
const ids = new Set();
const footerResponse = await fetch(
  `${base}cidade?per_page=4&page=1&_fields=id,slug,title,acf`,
  { signal: AbortSignal.timeout(10000) },
);
if (!footerResponse.ok)
  throw new Error(`Footer cities ${footerResponse.status}`);
const footerBody = await footerResponse.text();
corpus.footerCities = JSON.parse(footerBody);
corpus.requests.push({
  endpoint: "cidade (footer)",
  page: 1,
  bytes: Buffer.byteLength(footerBody),
});
const add = (value) => {
  if (Number.isSafeInteger(Number(value)) && Number(value) > 0)
    ids.add(Number(value));
};
for (const [endpoint, items] of Object.entries(corpus.endpoints))
  for (const item of items) {
    add(item.featured_media);
    for (const value of Object.values(item.acf?.galeria || {})) add(value);
    for (const field of ["logo", "imagem", "imagem_fundo", "hero", "final_cta"])
      add(item.acf?.[field]);
    void endpoint;
  }
corpus.endpoints.media = [];
const mediaIds = [...ids].sort((a, b) => a - b);
for (let offset = 0; offset < mediaIds.length; offset += 100) {
  const response = await fetch(
    `${base}media?per_page=100&include=${mediaIds.slice(offset, offset + 100).join(",")}`,
    { signal: AbortSignal.timeout(10000) },
  );
  if (!response.ok) throw new Error(`Media ${response.status}`);
  const text = await response.text();
  corpus.endpoints.media.push(...JSON.parse(text));
  corpus.requests.push({ endpoint: "media", bytes: Buffer.byteLength(text) });
}
mkdirSync("artifacts/worker-audit", { recursive: true });
writeFileSync("artifacts/worker-audit/corpus.json", JSON.stringify(corpus));
writeFileSync(
  "docs/performance/worker-corpus-summary.json",
  JSON.stringify(
    {
      capturedAt: corpus.capturedAt,
      counts: Object.fromEntries(
        Object.entries(corpus.endpoints).map(([key, items]) => [
          key,
          items.length,
        ]),
      ),
      requests: corpus.requests,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    counts: Object.fromEntries(
      Object.entries(corpus.endpoints).map(([key, items]) => [
        key,
        items.length,
      ]),
    ),
    requests: corpus.requests.length,
  }),
);

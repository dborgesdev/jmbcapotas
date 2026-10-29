import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";

const read = (name) =>
  JSON.parse(readFileSync(`docs/performance/${name}.json`, "utf8"));
const before = read("before"),
  after = read("after");
const names = [
  "Home",
  "Catálogo",
  "Categoria fibra",
  "Marca Fiat",
  "Produto CFF-01",
  "Pronta entrega",
  "Trabalhos",
  "Trabalho individual",
  "Blog",
  "Artigo Ram 2500",
  "Quem somos",
  "Conserto",
  "Cidades (lista completa)",
];
const cold = before.filter((r) => r.cache === "cold");
const rows = cold.map((a, i) => {
  const b = after.find((r) => r.path === a.path && r.cache === "cold");
  assert.equal(
    a.contentFingerprint,
    b.contentFingerprint,
    `${a.path}: conteúdo normalizado`,
  );
  assert.equal(a.htmlFingerprint, b.htmlFingerprint, `${a.path}: HTML público`);
  assert.ok(b.http < a.http, `${a.path}: menos chamadas HTTP`);
  assert.ok(
    a.calls.every((c) => c.status === 200) &&
      b.calls.every((c) => c.status === 200),
    `${a.path}: nenhuma falha mascarada`,
  );
  return { a, b, name: names[i] };
});
for (const row of [...before, ...after].filter((r) => r.cache === "warm"))
  assert.equal(row.http, 0, `${row.path}: cache quente`);
const table = (headers, values) =>
  `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n${values.map((v) => `| ${v.join(" | ")} |`).join("\n")}\n`;
const arrow = (a, b) => `${a} → ${b}`;
const kb = (n) => (n / 1024).toFixed(1);
const countEndpoints = (data) => {
  const counts = new Map();
  for (const r of data.filter((r) => r.cache === "cold"))
    for (const call of r.calls) {
      const endpoint = call.endpoint
        .split("?")[0]
        .replace("/wp-json/wp/v2/", "")
        .replace(/^media\/\d+$/, "media/{id}");
      counts.set(endpoint, (counts.get(endpoint) || 0) + 1);
    }
  return counts;
};
const endpointsBefore = countEndpoints(before),
  endpointsAfter = countEndpoints(after);
const native = read("native-endpoints");
const output = [
  "# Medições REST e SSR dos componentes\n",
  "Amostra local final sequencial em 29/10/2026. A → D = antes → depois. Frio/quente referem-se à memória do frontend. Métodos, limites e comandos em [relatório técnico](../rest-performance.md). Bytes são JSON descomprimido, incluindo attachments; tempos não são médias estatísticas nem TTFB de produção.\n",
  "## Cache frio por página\n",
  table(
    [
      "Página",
      "HTTP A → D",
      "media/{id} A → D",
      "Dados ms A → D",
      "JSON KiB A → D",
      "SSR componentes ms A → D",
    ],
    rows.map(({ a, b, name }) => [
      name,
      arrow(a.http, b.http),
      arrow(a.media, b.media),
      arrow(a.ms, b.ms),
      arrow(kb(a.bytes), kb(b.bytes)),
      arrow(a.componentSsrMs, b.componentSsrMs),
    ]),
  ),
  "A renderização acima é somente `renderToStaticMarkup(SiteView)` após carregar dados reais, com aquecimento inicial de React/JIT incluído. A verificação de HTML/status/metadados do Worker local é feita separadamente por `pnpm test:ssr`. Não medimos TTFB antes/depois em Workers de produção.\n",
  "## Cache e deduplicação por página\n",
  table(
    [
      "Página",
      "HIT frio A → D",
      "Pending frio A → D",
      "HTTP quente A → D",
      "HIT quente A → D",
      "Dados quentes ms A → D",
    ],
    rows.map(({ a, b, name }) => {
      const aw = before.find((r) => r.path === a.path && r.cache === "warm");
      const bw = after.find((r) => r.path === a.path && r.cache === "warm");
      return [
        name,
        arrow(a.hits, b.hits),
        arrow(a.deduplications, b.deduplications),
        arrow(aw.http, bw.http),
        arrow(aw.hits, bw.hits),
        arrow(aw.ms, bw.ms),
      ];
    }),
  ),
  "MISS equivale às chamadas HTTP na tabela anterior. A redução de HIT/pending em algumas páginas decorre da eliminação das chamadas individuais redundantes; não significa pior cache. Site-config possui cache próprio e pode evitar a entrada no transporte.\n",
  "## Endpoints: soma dos 13 carregamentos frios isolados\n",
  table(
    ["Endpoint", "Antes", "Depois", "Eliminadas (negativo = adicionadas)"],
    [...new Set([...endpointsBefore.keys(), ...endpointsAfter.keys()])]
      .sort()
      .map((e) => [
        e,
        endpointsBefore.get(e) || 0,
        endpointsAfter.get(e) || 0,
        (endpointsBefore.get(e) || 0) - (endpointsAfter.get(e) || 0),
      ]),
  ),
  "As consultas de conteúdo renderizado usam embed restrito; `/media` são coleções por include com projeção `_fields`. A única consulta individual recorrente é o attachment compartilhado do Hero/CTA, cujo ACF continua retornando ID.\n",
  "## Payload por resposta: teste de recursos nativos\n",
  table(
    [
      "Endpoint (1 item)",
      "Normal bytes",
      "Standard bytes",
      "Embed destacado bytes",
      "Standard + embed bytes",
    ],
    [...new Set(native.map((r) => r.endpoint))].map((endpoint) => [
      endpoint,
      ...["plain", "standard", "embed", "combined"].map(
        (mode) =>
          native.find((r) => r.endpoint === endpoint && r.mode === mode)
            ?.bytes ?? "—",
      ),
    ]),
  ),
  "O aumento por resposta de conteúdo foi compensado pela eliminação das respostas individuais e pela projeção dos lotes: o JSON total diminuiu nas 13 páginas medidas. No formato standard observado, imagens ACF preenchidas são URLs sem metadados; não ativamos esse formato. O teste adicional com embed completo está em `native-acf-detail.json`.\n",
  "## Conservação dos dados\n",
  "Os 13 hashes SHA-256 de conteúdo público normalizado e os 13 hashes do HTML renderizado coincidem antes/depois. Cidades são comparadas integralmente na rota de cidades e pelos quatro links usados nas demais rotas. Incluem galerias em ordem, URLs, alt, dimensões, srcSet, configuração, taxonomias, paginação, relacionados e clientes. Todos os endpoints medidos retornaram 200; nenhuma redução dependeu de esconder uma falha. Os logs JSON registram o path completo de cada cenário e duração/bytes por endpoint.\n",
];
writeFileSync("docs/performance/results.md", output.join("\n"));
console.log(
  "Results written; all 13 fingerprints, HTTP reductions and warm-cache assertions passed.",
);

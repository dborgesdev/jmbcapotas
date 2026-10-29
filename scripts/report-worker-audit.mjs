import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const variants = ["main", "rest", "final"];
const data = Object.fromEntries(
  variants.map((name) => [
    name,
    JSON.parse(
      readFileSync(`docs/performance/worker-runtime/${name}.json`, "utf8"),
    ).results,
  ]),
);
const paths = data.main
  .filter((row) => row.cache === "cold")
  .map((row) => row.path);
const row = (variant, path, cache) =>
  data[variant].find((row) => row.path === path && row.cache === cache);
for (const path of paths) {
  for (const variant of ["rest", "final"]) {
    const a = row("main", path, "cold"),
      b = row(variant, path, "cold");
    assert.equal(b.status, a.status, `${variant} ${path}: HTTP`);
    assert.equal(b.mainHash, a.mainHash, `${variant} ${path}: main HTML`);
    assert.equal(
      b.footerStableHash,
      a.footerStableHash,
      `${variant} ${path}: footer except authorized city links`,
    );
    if (a.responseHash)
      assert.equal(
        b.responseHash,
        a.responseHash,
        `${variant} ${path}: full special response`,
      );
  }
  for (const variant of variants)
    assert.equal(
      row(variant, path, "warm").subrequests,
      0,
      `${variant} ${path}: warm cache`,
    );
}
const parseConfig = (text) => JSON.parse(text.replace(/,\s*([}\]])/g, "$1"));
const original = parseConfig(
  execFileSync("git", ["show", "e93edf437290a242a5a7160fabcdde7855995297:wrangler.jsonc"], { encoding: "utf8" }),
);
const current = parseConfig(readFileSync("wrangler.jsonc", "utf8"));
const { observability, ...unchanged } = current;
assert.deepEqual(unchanged, original, "Wrangler: only observability added");
assert.deepEqual(observability, {
  logs: {
    enabled: true,
    head_sampling_rate: 1,
    invocation_logs: true,
    persist: true,
  },
  traces: { enabled: false },
});
assert.deepEqual(
  JSON.parse(readFileSync("dist/server/wrangler.json", "utf8")).observability,
  observability,
);
const table = (headers, values) =>
  `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n${values.map((values) => `| ${values.join(" | ")} |`).join("\n")}\n`;
const kb = (value) => (value / 1024).toFixed(1),
  mb = (value) => (value / 1024 / 1024).toFixed(2);
const triple = (values) => values.join(" / ");
const median = (values) => {
  const sorted = values.toSorted((a, b) => a - b),
    middle = Math.floor(sorted.length / 2);
  return Number(
    (sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2
    ).toFixed(2),
  );
};
const summary = {};
for (const variant of variants) {
  const sequence = data[variant].filter(
    (row) => row.cache === "sequential-warm",
  );
  const memories = data[variant]
    .flatMap((row) => [row.memoryAfter?.usedSize, row.memory?.usedSize])
    .filter(Boolean);
  const root =
    variant === "final"
      ? resolve("dist/server")
      : resolve(`artifacts/worker-audit/${variant}/dist/server`);
  const files = [
    resolve(root, "index.js"),
    ...readdirSync(resolve(root, "assets"))
      .filter((name) => name.endsWith(".js"))
      .map((name) => resolve(root, "assets", name)),
  ];
  summary[variant] = {
    sequentialMedianWallMs: median(sequence.map((row) => row.wallMs)),
    maxObservedHeapBytes: Math.max(...memories),
    sequenceHeapStartBytes: sequence[0].memoryBefore?.usedSize,
    sequenceHeapEndBytes: sequence.at(-1).memoryAfter?.usedSize,
    afterSequenceHeapBytes: data[variant].find(
      (row) => row.cache === "after-sequence",
    ).memory?.usedSize,
    serverJsBytes: files.reduce((sum, file) => sum + statSync(file).size, 0),
    serverJsGzipSumBytes: files.reduce(
      (sum, file) => sum + gzipSync(readFileSync(file)).length,
      0,
    ),
  };
}
const output = [
  "# Comparação offline no workerd\n",
  "M / R / F = main e93edf4 / otimização REST preservada / versão final da auditoria. Mesma cópia real do CMS, serviço REST reproduzido localmente com 5 ms de espera artificial por consulta. Não são medições da rede de produção. Amostras de wall-clock incluem IPC, instrumentação, JIT e carga do computador; não são CPU faturada nem garantia de latência.\n",
  "## Rotas, wall-clock e subsolicitações\n",
  table(
    [
      "Rota",
      "HTTP",
      "Subsolicitações frias M/R/F",
      "Wall frio ms M/R/F",
      "Wall quente ms M/R/F",
    ],
    paths.map((path) => [
      path,
      row("final", path, "cold").status,
      triple(variants.map((v) => row(v, path, "cold").subrequests)),
      triple(variants.map((v) => row(v, path, "cold").wallMs)),
      triple(variants.map((v) => row(v, path, "warm").wallMs)),
    ]),
  ),
  "Todas as rotas quentes fizeram zero subsolicitações. Redirecionamentos 307/308 de normalização são seguidos localmente até o conteúdo; 301 de migração permanece visível. O runtime local não valida aprovação dos limites do plano Free.\n",
  "## JSON, serialização e heap V8\n",
  table(
    [
      "Rota",
      "JSON frio KiB M/R/F",
      "Scripts inline KiB M/R/F",
      "HTML resposta KiB M/R/F",
      "Heap após frio MiB M/R/F",
    ],
    paths.map((path) => [
      path,
      triple(variants.map((v) => kb(row(v, path, "cold").jsonBytes))),
      triple(variants.map((v) => kb(row(v, path, "cold").inlineScriptBytes))),
      triple(variants.map((v) => kb(row(v, path, "cold").htmlBytes))),
      triple(
        variants.map((v) => mb(row(v, path, "cold").memoryAfter.usedSize)),
      ),
    ]),
  ),
  "Scripts inline são uma aproximação do volume serializado: incluem também bootstrap e instruções de streaming, não somente os dados de rota. Heap é `Runtime.getHeapUsage.usedSize` no isolate do Worker local; snapshots após requisições não representam pico nem memória total de produção (WASM/allocações externas incluídas no limite de 128 MB).\n",
  "## Sequência, concorrência e falhas\n",
  table(
    [
      "Cenário Home",
      "M wall ms / chamadas",
      "R wall ms / chamadas",
      "F wall ms / chamadas",
    ],
    ["concurrent-cold", "concurrent-warm", "slow-rest", "partial-failure"].map(
      (cache) => [
        cache,
        ...variants.map((v) => {
          const r = row(v, "/", cache);
          assert.ok(r.statuses.every((status) => status === 200));
          return `${r.wallMs} / ${r.subrequests}`;
        }),
      ],
    ),
  ),
  "Concurrent = quatro respostas simultâneas; wall, subsolicitações e perfis representam o lote inteiro, não cada requisição. Há deduplicação entre invocações do mesmo isolate. Slow-rest usa 50 ms por resposta local; partial-failure simula HTTP 503 apenas em posts, preservando Home 200. A soma de `restWaitSumMs` nos JSONs se sobrepõe entre consultas; não pode ser subtraída do wall para calcular CPU.\n",
  table(
    [
      "Variante",
      "Mediana wall de 10 Homes quentes ms",
      "Maior heap observado MiB",
      "Heap início/fim da sequência MiB",
      "JS servidor raw / soma gzip KiB",
    ],
    variants.map((v) => {
      const s = summary[v];
      return [
        v,
        s.sequentialMedianWallMs,
        mb(s.maxObservedHeapBytes),
        `${mb(s.sequenceHeapStartBytes)} / ${mb(s.sequenceHeapEndBytes)}`,
        `${kb(s.serverJsBytes)} / ${kb(s.serverJsGzipSumBytes)}`,
      ];
    }),
  ),
  "Sem GC forçado. Variação do heap inclui objetos transitórios, aquecimento e coleta automática; dez acessos à mesma rota não provam ausência de crescimento sob todos os filtros/conteúdos. Os bytes gzip acima somam arquivos comprimidos individualmente e não representam o tamanho oficial do upload nem startup_time_ms.\n",
  "## CPU e preservação\n",
  "CPU faturada de produção: **não disponível**. Foram obtidos perfis V8 do workerd real local, armazenados em `artifacts/worker-audit/profiles`. `sampledNonIdleMs` e frames são diagnósticos amostrados: podem incluir atribuição de tempo assíncrono/nativo e overhead do inspector. Não usamos esses números como CPU por invocação nem para declarar atendimento a 10 ms. Não se usa Node/Vitest/renderToStaticMarkup como CPU do Worker.\n",
  `As ${paths.length} rotas preservaram status e o hash do conteúdo de main. O rodapé preservou hash após excluir exclusivamente os quatro links de cidades cuja mudança foi autorizada pelo usuário. Sitemap e robots preservaram também o hash da resposta completa. O arquivo Wrangler preservou todos os campos anteriores; apenas observability foi acrescentado e os mesmos valores chegaram à configuração do build.\n`,
  "Logs completos: [main](main.json), [REST](rest.json), [final](final.json). Diagnóstico e restrições: [auditoria](../cloudflare-worker-audit.md).\n",
];
writeFileSync(
  "docs/performance/worker-runtime/comparison.md",
  output.join("\n"),
);
writeFileSync(
  "docs/performance/worker-runtime/summary.json",
  JSON.stringify(summary, null, 2),
);
console.log(
  "Worker audit comparisons, content hashes, warm-cache and Wrangler invariants passed.",
);

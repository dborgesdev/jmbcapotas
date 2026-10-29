import { createRequire } from "node:module";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { createReplay } from "./worker-audit-replay.mjs";

const require = createRequire(import.meta.url);
const { Miniflare, Log, LogLevel, convertV4MiniflareOptions } = createRequire(
  require.resolve("wrangler/package.json"),
)("miniflare");
const variant = process.argv[2] || "final";
const root =
  variant === "final"
    ? resolve(".")
    : resolve(`artifacts/worker-audit/${variant}`);
const paths = [
  "/",
  "/produtos/",
  "/produtos/capota-de-fibra/",
  "/marcas/capota-de-fibra-para-fiat/",
  "/capota-para-picape/capota-de-fibra-com-portas-laterais-para-fiat-strada/",
  "/capota-para-picape/capota-furgao-com-porta-traseira-horizontal-vw-saveiro/",
  "/capota-para-picape/capota-de-fibra-basica-para-land-rover-defender/",
  "/pronta-entrega/",
  "/trabalhos/",
  "/trabalhos/instalacao-capota-de-fibra-empresa-xyz/",
  "/blog/",
  "/blog/jmb-capotas-apresenta-nova-ram-2500-rodeo-edition/",
  "/quem-somos/",
  "/conserto-de-capotas-de-fibra/",
  "/cidades/",
  "/venda-de-capota-para-picape-em-curitiba/",
  "/produtos/?marca=4&modelo=5&q=Strada",
  "/caminho-inexistente/",
  "/nao/existe/aqui/",
  "/carrinho/",
  "/sitemap.xml",
  "/robots.txt",
];
const results = [];
mkdirSync("docs/performance/worker-runtime", { recursive: true });
mkdirSync("artifacts/worker-audit/profiles", { recursive: true });
async function start(options = {}) {
  const calls = [];
  const server = resolve(root, "dist/server");
  const modules = [
    "index.js",
    ...readdirSync(resolve(server, "assets"))
      .filter((file) => file.endsWith(".js"))
      .map((file) => `assets/${file}`),
  ].map((file) => ({ type: "ESModule", path: resolve(server, file) }));
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      inspectorPort: 0,
      log: new Log(LogLevel.ERROR),
      workers: [
        {
          name: "jmb-audit",
          modules,
          modulesRoot: server,
          compatibilityDate: "2026-10-07",
          compatibilityFlags: ["nodejs_compat"],
          outboundService: createReplay({
            ...options,
            onCall: (call) => calls.push(call),
          }),
        },
      ],
    }),
  );
  await mf.ready;
  return { mf, calls };
}
async function inspect(mf) {
  const inspector = await mf.getInspectorURL();
  const httpInspector = new URL(inspector);
  httpInspector.protocol = "http:";
  const targets = await (
    await fetch(new URL("/json/list", httpInspector))
  ).json();
  const target =
    targets.find(
      (target) =>
        target.webSocketDebuggerUrl &&
        (target.title || "").includes("jmb-audit"),
    ) || targets[0];
  if (!target?.webSocketDebuggerUrl)
    throw new Error("No worker inspector target");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const pair = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(pair?.timer);
      if (message.error) pair?.reject(new Error(message.error.message));
      else pair?.resolve(message.result);
    }
  });
  await new Promise((resolve, reject) => {
    const key = ++id;
    pending.set(key, { resolve, reject });
    socket.send(JSON.stringify({ id: key, method: "Profiler.enable" }));
  }).catch(() => {});
  return {
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const key = ++id;
        const timer = setTimeout(() => {
          pending.delete(key);
          reject(new Error(`${method}: inspector timeout`));
        }, 5000);
        pending.set(key, { resolve, reject, timer });
        socket.send(JSON.stringify({ id: key, method, params }));
      });
    },
    close() {
      socket.close();
    },
  };
}
async function measure(instance, inspector, path, cache, count = 1) {
  instance.calls.length = 0;
  const memoryBefore = await inspector
    .send("Runtime.getHeapUsage")
    .catch(() => null);
  await inspector.send("Profiler.start").catch(() => {});
  const start = performance.now();
  const redirects = [];
  const responses = await Promise.all(
    Array.from({ length: count }, async () => {
      let url = `https://jmbcapotas.com.br${path}`;
      for (let attempt = 0; attempt < 4; attempt++) {
        const response = await instance.mf.dispatchFetch(url, {
          redirect: "manual",
        });
        const html = await response.text();
        if (
          [307, 308].includes(response.status) &&
          response.headers.get("location")
        ) {
          const next = new URL(response.headers.get("location"), url);
          if (next.hostname !== "jmbcapotas.com.br")
            throw new Error("Unexpected redirect host");
          redirects.push({
            status: response.status,
            location: next.pathname + next.search,
          });
          url = next.href;
          continue;
        }
        return { status: response.status, html };
      }
      throw new Error("Normalization redirect loop");
    }),
  );
  const html = responses[0].html;
  const wallMs = Number((performance.now() - start).toFixed(2));
  const profile = await inspector
    .send("Profiler.stop")
    .catch((error) => ({ error: String(error) }));
  const cpu = profile?.profile;
  const nodes = new Map(cpu?.nodes.map((node) => [node.id, node]) || []);
  const sampled = new Map();
  let sampledActiveUs = 0;
  for (let i = 0; i < (cpu?.samples?.length || 0); i++) {
    const node = nodes.get(cpu.samples[i]);
    const name = node?.callFrame.functionName || "(anonymous)";
    const duration = cpu.timeDeltas?.[i] || 0;
    if (name !== "(idle)") {
      sampledActiveUs += duration;
      const key = `${name} (${node?.callFrame.url || "native"})`;
      sampled.set(key, (sampled.get(key) || 0) + duration);
    }
  }
  const memoryAfter = await inspector
    .send("Runtime.getHeapUsage")
    .catch(() => null);
  const key = `${variant}-${results.length}-${cache}`;
  if (profile?.profile)
    writeFileSync(
      `artifacts/worker-audit/profiles/${key}.cpuprofile`,
      JSON.stringify(profile.profile),
    );
  const visible =
    (html.match(/<main\b[\s\S]*?<\/main>/)?.[0] || "") +
    (html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] || "");
  const scriptBytes = [
    ...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g),
  ].reduce((sum, match) => sum + Buffer.byteLength(match[1]), 0);
  const row = {
    variant,
    path,
    cache,
    status: responses[0].status,
    statuses: responses.map((response) => response.status),
    requests: count,
    redirects,
    wallMs,
    sampledNonIdleMs: cpu ? Number((sampledActiveUs / 1000).toFixed(2)) : null,
    sampledHotspots: [...sampled]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([frame, us]) => ({ frame, ms: Number((us / 1000).toFixed(2)) })),
    subrequests: instance.calls.length,
    jsonBytes: instance.calls.reduce((sum, call) => sum + call.bytes, 0),
    restWaitSumMs: Number(
      instance.calls.reduce((sum, call) => sum + call.waitMs, 0).toFixed(2),
    ),
    htmlBytes: Buffer.byteLength(html),
    inlineScriptBytes: scriptBytes,
    visibleHash: createHash("sha256").update(visible).digest("hex"),
    mainHash: createHash("sha256")
      .update(html.match(/<main\b[\s\S]*?<\/main>/)?.[0] || "")
      .digest("hex"),
    footerStableHash: createHash("sha256")
      .update(
        (html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] || "").replace(
          /<a\b(?=[^>]*href="\/venda-de-capota-para-picape-em-)[\s\S]*?<\/a>/g,
          "",
        ),
      )
      .digest("hex"),
    responseHash: ["/sitemap.xml", "/robots.txt"].includes(path)
      ? createHash("sha256").update(html).digest("hex")
      : undefined,
    memoryBefore,
    memoryAfter,
    calls: [...instance.calls],
    profile: key,
  };
  results.push(row);
  console.log(
    `${variant} ${cache} ${path}: ${row.status} ${wallMs}ms ${row.subrequests} calls`,
  );
}
if (!process.env.AUDIT_SMOKE) {
  const instance = await start();
  const inspector = await inspect(instance.mf);
  try {
    await measure(instance, inspector, "/", "concurrent-cold", 4);
    await measure(instance, inspector, "/", "concurrent-warm", 4);
    for (let i = 0; i < 10; i++)
      await measure(instance, inspector, "/", "sequential-warm");
    results.push({
      variant,
      cache: "after-sequence",
      memory: await inspector.send("Runtime.getHeapUsage").catch(() => null),
    });
  } finally {
    inspector.close();
    await instance.mf.dispose();
  }
  for (const [label, options] of [
    ["slow-rest", { delayMs: 50 }],
    ["partial-failure", { failEndpoint: "posts" }],
  ]) {
    const instance = await start(options);
    const inspector = await inspect(instance.mf);
    try {
      await measure(instance, inspector, "/", label);
    } finally {
      inspector.close();
      await instance.mf.dispose();
    }
  }
}
const selected = process.env.AUDIT_SMOKE ? paths.slice(0, 1) : paths;
for (const path of selected) {
  const instance = await start();
  let inspector;
  try {
    inspector = await inspect(instance.mf);
    await measure(instance, inspector, path, "cold");
    await measure(instance, inspector, path, "warm");
  } finally {
    inspector?.close();
    await instance.mf.dispose();
  }
}
writeFileSync(
  `docs/performance/worker-runtime/${variant}.json`,
  JSON.stringify(
    {
      variant,
      localOnly: true,
      simulatedRestDelayMs: 5,
      productionMeteredCpuMs: null,
      results,
    },
    null,
    2,
  ),
);

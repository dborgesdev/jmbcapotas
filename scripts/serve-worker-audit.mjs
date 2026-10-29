import { createRequire } from "node:module";
import { createServer } from "node:http";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, sep, extname } from "node:path";
import { createReplay } from "./worker-audit-replay.mjs";

const require = createRequire(import.meta.url);
const { Miniflare, convertV4MiniflareOptions } = createRequire(
  require.resolve("wrangler/package.json"),
)("miniflare");
const serverRoot = resolve("dist/server"),
  clientRoot = resolve("dist/client");
const modules = [
  "index.js",
  ...readdirSync(resolve(serverRoot, "assets"))
    .filter((file) => file.endsWith(".js"))
    .map((file) => `assets/${file}`),
].map((file) => ({ type: "ESModule", path: resolve(serverRoot, file) }));
const mf = new Miniflare(
  convertV4MiniflareOptions({
    workers: [
      {
        name: "jmb-offline-ssr",
        modules,
        modulesRoot: serverRoot,
        compatibilityDate: "2026-10-07",
        compatibilityFlags: ["nodejs_compat"],
        outboundService: createReplay({ delayMs: 0 }),
      },
    ],
  }),
);
await mf.ready;
const types = {
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".css": "text/css",
  ".js": "application/javascript",
};
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "https://jmbcapotas.com.br");
    const asset = resolve(clientRoot, "." + url.pathname);
    if (
      asset.startsWith(clientRoot + sep) &&
      existsSync(asset) &&
      statSync(asset).isFile()
    ) {
      response.writeHead(200, {
        "content-type": types[extname(asset)] || "application/octet-stream",
      });
      response.end(readFileSync(asset));
      return;
    }
    const result = await mf.dispatchFetch(url, {
      method: request.method,
      redirect: "manual",
    });
    response.writeHead(result.status, Object.fromEntries(result.headers));
    response.end(Buffer.from(await result.arrayBuffer()));
  } catch (error) {
    console.error(error);
    response.writeHead(500);
    response.end("Offline audit failure");
  }
});
server.listen(3100, "127.0.0.1", () =>
  console.log(
    "Offline workerd SSR: http://127.0.0.1:3100 — external fetches blocked",
  ),
);
process.on("SIGINT", async () => {
  server.close();
  await mf.dispose();
  process.exit(0);
});

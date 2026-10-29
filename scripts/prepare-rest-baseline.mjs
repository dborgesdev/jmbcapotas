import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Read committed sources without changing the checkout or Git index.
const files = execFileSync(
  "git",
  ["ls-tree", "-r", "--name-only", "HEAD", "src"],
  { encoding: "utf8" },
)
  .trim()
  .split(/\r?\n/);
for (const file of files) {
  if (!file.startsWith("src/lib/")) continue;
  const target = join("artifacts/rest-baseline", file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, execFileSync("git", ["show", `HEAD:${file}`]));
}
// Identical opt-in counters; transport/cache behavior is unchanged from HEAD.
writeFileSync(
  "artifacts/rest-baseline/src/lib/wordpress/client.ts",
  readFileSync("src/lib/wordpress/client.ts"),
);
console.log(
  "Baseline prepared from HEAD in artifacts/rest-baseline (ignored by Git).",
);

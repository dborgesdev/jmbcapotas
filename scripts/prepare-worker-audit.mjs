import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

const variant = process.argv[2];
if (!["main", "rest", "context-before"].includes(variant))
  throw new Error("Choose main, rest or context-before");
const target = resolve(`artifacts/worker-audit/${variant}`);
if (existsSync(join(target, "package.json")))
  throw new Error("Snapshot exists; preserve it for comparisons.");
mkdirSync(target, { recursive: true });
const files = execFileSync("git", ["ls-tree", "-r", "--name-only", "HEAD"], {
  encoding: "utf8",
})
  .trim()
  .split(/\r?\n/)
  .filter(
    (file) =>
      file.startsWith("src/") ||
      file.startsWith("public/") ||
      [
        "package.json",
        "tsconfig.json",
        "vite.config.ts",
        "wrangler.jsonc",
      ].includes(file),
  );
for (const file of files) {
  const destination = join(target, file);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(
    destination,
    variant !== "rest"
      ? execFileSync("git", ["show", `HEAD:${file}`], {
          maxBuffer: 64 * 1024 * 1024,
        })
      : readFileSync(file),
  );
}
if (variant === "rest") cpSync("src", join(target, "src"), { recursive: true });
cpSync(".gitignore", join(target, ".gitignore"));
const css = join(target, "src/styles/app.css");
writeFileSync(
  css,
  readFileSync(css, "utf8").replace(
    '@import "tailwindcss";',
    '@import "tailwindcss" source("../");',
  ),
);
symlinkSync(resolve("node_modules"), join(target, "node_modules"), "junction");
console.log(target);

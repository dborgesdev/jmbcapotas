import fs from "node:fs";
import assert from "node:assert/strict";
const read = (n) =>
  JSON.parse(
    fs.readFileSync(`docs/performance/worker-runtime/context-${n}.json`),
  ).results;
const before = read("before"),
  after = read("after");
for (const x of before.filter((x) => x.cache === "cold")) {
  const y = after.find((y) => y.cache === "cold" && y.path === x.path);
  assert.equal(y.status, x.status);
  assert.equal(y.footerStableHash, x.footerStableHash);
  if (!/defender|strada|dakota/.test(x.path))
    assert.equal(y.mainHash, x.mainHash);
}
for (const r of after)
  for (const c of r.calls || [])
    if (c.endpoint === "produto")
      assert.notEqual(
        new URLSearchParams(c.query).get("per_page"),
        "100",
        "No complete product scan",
      );
const names = [
  "Home",
  "Catálogo",
  "Saveiro",
  "Defender (zero)",
  "Strada",
  "Hilux (cinco → quatro)",
  "Dakota (dois)",
  "Sem marca/modelo",
];
const table = before
  .filter((r) => r.cache === "cold")
  .map((a, i) => {
    const b = after.find((r) => r.cache === "cold" && r.path === a.path);
    const warm = (rows) =>
      rows.find((r) => r.cache === "warm" && r.path === a.path).wallMs;
    return `| ${names[i]} | ${a.subrequests} → ${b.subrequests} | ${a.jsonBytes} → ${b.jsonBytes} | ${a.wallMs} → ${b.wallMs} | ${warm(before)} → ${warm(after)} |`;
  })
  .join("\n");

console.log(table);
console.log("Content/status/footer and absence of full product scans: passed");

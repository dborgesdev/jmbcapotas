#!/usr/bin/env node
/**
 * Audita URLs antigas /capota-para-picapes/ contra os produtos publicados.
 * Uso: node scripts/audit-legacy-products.mjs caminho/para/jmb-auditoria-redirects.csv
 * Somente leitura: não altera WordPress nem arquivos do projeto.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const source = process.argv[2];
if (!source) {
  console.error("Uso: node scripts/audit-legacy-products.mjs <auditoria.csv> [saida.csv]");
  process.exit(1);
}
const output = resolve(process.argv[3] || "legacy-products-review.csv");
const api = "https://painel.jmbcapotas.com.br/wp-json/wp/v2/produto";

function parseCsv(text) {
  const rows = [];
  let field = "", row = [], quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...data] = rows;
  return data.map(values => Object.fromEntries(headers.map((key, i) => [key.replace(/^\uFEFF/, ""), values[i] || ""])));
}
function csvCell(v) {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
}
const normalize = s => decodeURIComponent(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const stop = new Set(["capota","capotas","para","de","da","do","com","em","e","picape","picapes","fibra"]);
const tokens = s => new Set(normalize(s).split("-").filter(w => w.length > 1 && !stop.has(w)));
function score(a,b) {
  const aa=tokens(a), bb=tokens(b);
  const intersection=[...aa].filter(x=>bb.has(x)).length;
  return intersection ? (2*intersection)/(aa.size+bb.size) : 0;
}
async function getProducts() {
  const products = [];
  for (let page=1; ; page++) {
    const u=new URL(api);
    u.searchParams.set("per_page","100");
    u.searchParams.set("page",String(page));
    u.searchParams.set("orderby","id");
    u.searchParams.set("order","asc");
    const response=await fetch(u,{signal:AbortSignal.timeout(20000)});
    if(!response.ok) throw new Error("WordPress API HTTP "+response.status+" página "+page);
    const rows=await response.json();
    products.push(...rows);
    const totalPages=Number(response.headers.get("x-wp-totalpages") || 1);
    if(page>=totalPages) break;
  }
  return products;
}
const old=parseCsv(readFileSync(resolve(source),"utf8")).filter(r=>r.url_antiga?.startsWith("/capota-para-picapes/"));
const products=await getProducts();
const report=old.map(r=>{
  const oldSlug=r.url_antiga.split("/").filter(Boolean).at(-1);
  const exact=products.find(p=>p.slug===oldSlug);
  const ranked=products.map(p=>({p,score:score(oldSlug,p.slug)})).sort((a,b)=>b.score-a.score);
  const best=exact ? {p:exact,score:1} : ranked[0];
  const second=ranked.find(x=>x.p.id!==best?.p.id);
  return {
    url_antiga:r.url_antiga,
    slug_antigo:oldSlug,
    situacao:exact?"slug-exato":"revisar-manualmente",
    id_candidato:best?.p.id??"",
    slug_candidato:best?.p.slug??"",
    titulo_candidato:best?.p.title?.rendered?.replace(/<[^>]*>/g,"")??"",
    similaridade:best?.score?.toFixed(3)??"",
    segundo_candidato:second?.p.slug??"",
    destino_confirmado:"",
    observacao:exact?"Confirmar URL canônica pela categoria no frontend":"Similaridade é sugestão, não prova de equivalência",
  };
});
const headers=Object.keys(report[0] || {});
writeFileSync(output,"\uFEFF"+headers.join(",")+"\r\n"+report.map(row=>headers.map(k=>csvCell(row[k])).join(",")).join("\r\n")+"\r\n","utf8");
console.log("Produtos WordPress:",products.length);
console.log("URLs históricas analisadas:",old.length);
console.log("Slugs exatos:",report.filter(x=>x.situacao==="slug-exato").length);
console.log("Para revisão:",report.filter(x=>x.situacao!=="slug-exato").length);
console.log("Relatório:",output);

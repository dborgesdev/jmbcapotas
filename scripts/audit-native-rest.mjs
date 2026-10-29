import { mkdirSync, writeFileSync } from "node:fs";

const summarize = value=>Array.isArray(value)?value.map(summarize):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([k])=>['id','ID','featured_media','acf','_embedded','wp:featuredmedia','source_url','url','alt','alt_text','width','height','sizes','media_details','galeria','imagem_2','imagem_3','imagem_4','imagem_5','hero','final_cta','logo','imagem','imagem_fundo'].includes(k)||k.includes('width')||k.includes('height')||/^(thumbnail|medium|large|full|medium_large|\d+x\d+)$/.test(k)).map(([k,v])=>[k,summarize(v)])):value;

const base = "https://painel.jmbcapotas.com.br/wp-json/wp/v2/";
const endpoints = [
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
];
const detailed = [
  "produto?slug=capota-de-fibra-com-portas-laterais-para-fiat-strada",
  "trabalho?slug=instalacao-capota-de-fibra-empresa-xyz",
  "marca?per_page=100",
  "modelo?per_page=100",
  "categoria_produto?per_page=100",
  "site-config?slug=jmb-capotas",
];
mkdirSync("docs/performance", { recursive: true });
for (const [name, paths, embed] of [
  ["native-endpoints", endpoints, "wp:featuredmedia"],
  ["native-acf-detail", detailed, ""],
]) {
  const rows = [];
  for (const path of paths) {
    for (const mode of ["plain", "standard", "embed", "combined"]) {
      const url = new URL(path, base);
      if (!url.search) url.searchParams.set("per_page", "1");
      if (["standard", "combined"].includes(mode))
        url.searchParams.set("acf_format", "standard");
      if (["embed", "combined"].includes(mode))
        url.searchParams.set("_embed", embed);
      const start = performance.now();
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const body = await response.text();
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      rows.push({
        endpoint: path,
        mode,
        ms: Math.round(performance.now() - start),
        bytes: Buffer.byteLength(body),
        data: summarize(JSON.parse(body)),
      });
    }
  }
  writeFileSync(`docs/performance/${name}.json`, JSON.stringify(rows, null, 2));
  console.log(`${name}: ${rows.length} public GET responses saved.`);
}

import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const cases = [
  ["/", 200, "Pronta para o trabalho."],
  ["/produtos/", 200, "Encontre a capota para sua picape"],
  ["/produtos/capota-de-fibra/", 200, "Capota de Fibra"],
  ["/marcas/capota-de-fibra-para-fiat/", 200, "Strada 2020-26"],
  [
    "/capota-para-picape/capota-de-fibra-com-portas-laterais-para-fiat-strada/",
    200,
    "CFF-01",
  ],
  ["/pronta-entrega/", 200, "CFF-01"],
  ["/carrinho/", 200, "Seu carrinho"],
  ["/trabalhos/", 200, "Trabalhos que ganham a estrada"],
  [
    "/trabalhos/instalacao-capota-de-fibra-empresa-xyz/",
    200,
    "Produtos deste trabalho",
  ],
  ["/cidades/", 200, "Curitiba"],
  [
    "/venda-de-capota-para-picape-em-curitiba/",
    200,
    "Capota para picape em Curitiba/PR",
  ],
  ["/blog/", 200, "Em breve"],
  ["/caminho-inexistente/", 404, "Vamos voltar"],
  ["/produtos/inexistente/", 404, "Vamos voltar"],
  ["/blog/inexistente/", 404, "Vamos voltar"],
  ["/produtos/?pagina=999", 404, "Vamos voltar"],
  ["/marcas/capota-de-fibra-para-inexistente/", 404, "Vamos voltar"],
];
for (const [path, status, text] of cases) {
  const response = await fetch(base + path);
  const html = await response.text();
  assert.equal(response.status, status, path);
  assert.ok(html.includes(text), `${path}: conteúdo SSR`);
  if (status === 200) {
    assert.ok(
      html.includes(`https://jmbcapotas.com.br${path}`),
      `${path}: canonical`,
    );
    assert.ok(html.includes("og:title"), `${path}: Open Graph`);
    assert.ok(html.includes("twitter:card"), `${path}: Twitter`);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${path}: único H1`);
  }
  console.log(`${status} ${path} — SSR OK`);
}
const filter = await fetch(base + "/produtos/?marca=4&modelo=5&q=Strada");
assert.ok(
  (await filter.text()).includes("CFF-01"),
  "Busca e filtros combinados",
);
const empty = await fetch(base + "/produtos/?q=sem-resultados-xyz");
assert.ok(
  (await empty.text()).includes("Nenhum produto encontrado"),
  "Busca vazia",
);
const redirect = await fetch(
  base + "/produtos/capota-de-fibra-com-portas-laterais-para-fiat-strada/",
  { redirect: "manual" },
);
assert.equal(redirect.status, 301, "Alias de produto deve redirecionar");
assert.ok(redirect.headers.get("location").includes("/capota-para-picape/"));
const sitemap = await fetch(base + "/sitemap.xml");
assert.equal(sitemap.status, 200);
const xml = await sitemap.text();
assert.ok(xml.includes("/capota-para-picape/"));
assert.ok(xml.includes("/venda-de-capota-para-picape-em-curitiba/"));
assert.ok(!xml.includes("/carrinho/"));
assert.equal((await fetch(base + "/robots.txt")).status, 200);
assert.equal((await fetch(base + "/favicon.svg")).status, 200);
console.log("Busca, filtros, vazio, 301, sitemap, robots e favicon — OK");

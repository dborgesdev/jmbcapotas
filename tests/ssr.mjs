import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const cases = [
  ["/", 200, "Pronta para o trabalho."],
  ["/produtos/", 200, "Encontre o produto ideal para seu veículo"],
  ["/produtos/capota-de-fibra/", 200, "Capota de Fibra"],
  ["/marcas/capota-de-fibra-para-fiat/", 200, "Strada 2020-26"],
  [
    "/capota-para-picape/capota-de-fibra-com-portas-laterais-para-fiat-strada/",
    200,
    "CFF-01",
  ],
  ["/capota-para-picape/capota-furgao-com-porta-traseira-horizontal-vw-saveiro/", 200, "Saveiro"],
  ["/capota-para-picape/capota-de-fibra-basica-para-land-rover-defender/", 200, "Defender"],
  ["/pronta-entrega/", 200, "CFF-01"],
  ["/quem-somos/", 200, "Quem Somos?"],
  ["/a-fabrica/", 200, "A Fábrica"],
  ["/conserto-de-capotas-de-fibra/", 200, "Da escolha à estrada"],
  ["/produtos/acessorios/", 200, "Acessórios"],
  ["/marcas/capota-de-fibra-para-volkswagen/", 200, "Produtos para Volkswagen"],
  ["/blog/jmb-capotas-apresenta-nova-ram-2500-rodeo-edition/", 200, "Ram 2500"],
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
  ["/blog/", 200, "Na estrada com a JMB"],
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
  assert.ok(
    !html.includes("Adicionar ao carrinho") &&
      !html.includes('href="/carrinho/"'),
  );
  assert.ok(html.includes(text), `${path}: conteúdo SSR`);
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[1] || "";
  for (const property of [
    "og:title",
    "og:description",
    "og:type",
    "og:url",
    "og:image",
  ]) {
    assert.equal(
      (head.match(new RegExp(`property="${property}"`, "g")) || []).length,
      1,
      `${path}: único ${property} no SSR`,
    );
  }
  assert.equal(
    (head.match(/name="twitter:image"/g) || []).length,
    1,
    `${path}: Twitter image SSR`,
  );
  assert.ok(
    head.includes('content="summary_large_image"'),
    `${path}: Twitter large image`,
  );
  assert.equal(
    (head.match(/rel="icon"/g) || []).length,
    1,
    `${path}: favicon único`,
  );
  assert.ok(head.includes('href="/favicon.ico"'), `${path}: favicon oficial`);
  assert.ok(
    /property="og:image" content="https:\/\//.test(head),
    `${path}: imagem absoluta`,
  );
  assert.equal(
    (head.match(/rel="canonical"/g) || []).length,
    1,
    `${path}: canonical único`,
  );
  assert.ok(
    head.includes(`href="https://jmbcapotas.com.br${path.split("?")[0]}"`),
    `${path}: canonical da rota`,
  );
  if (
    path.includes("/capota-para-picape/") ||
    path.includes("/blog/jmb-capotas-") ||
    path.includes("/trabalhos/instalacao-")
  ) {
    assert.ok(
      !head.includes(
        'property="og:image" content="https://jmbcapotas.com.br/og-image.webp"',
      ),
      `${path}: preserva imagem individual`,
    );
  }
  if (["/", "/produtos/", "/caminho-inexistente/"].includes(path))
    assert.ok(
      head.includes('content="https://jmbcapotas.com.br/og-image.webp"'),
      `${path}: imagem padrão`,
    );
  if (status === 404)
    assert.ok(
      head.includes('content="noindex,follow"'),
      `${path}: 404 não indexável`,
    );
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
const nextPage = await fetch(base + "/produtos/?pagina=2");
assert.equal(nextPage.status, 200, "Paginação do catálogo real");
assert.ok((await nextPage.text()).includes("Anterior"));
const redirect = await fetch(
  base + "/produtos/capota-de-fibra-com-portas-laterais-para-fiat-strada/",
  { redirect: "manual" },
);
assert.equal(redirect.status, 301, "Alias de produto deve redirecionar");
assert.ok(redirect.headers.get("location").includes("/capota-para-picape/"));
for (const path of ["/carrinho/"]) {
  const response = await fetch(base + path, { redirect: "manual" });
  assert.equal(response.status, 301);
  assert.ok(response.headers.get("location").endsWith("/produtos/"));
}
const normalizedCart = await fetch(base + "/carrinho", { redirect: "manual" });
assert.equal(
  normalizedCart.status,
  307,
  "Preserva normalização global de barra",
);
assert.ok(normalizedCart.headers.get("location").endsWith("/carrinho/"));
assert.ok((await fetch(base + "/carrinho")).url.endsWith("/produtos/"));
const sitemap = await fetch(base + "/sitemap.xml");
assert.equal(sitemap.status, 200);
const xml = await sitemap.text();
assert.ok(xml.includes("/capota-para-picape/"));
assert.ok(xml.includes("/venda-de-capota-para-picape-em-curitiba/"));
assert.ok(!xml.includes("/carrinho/"));
assert.equal((await fetch(base + "/robots.txt")).status, 200);
assert.equal((await fetch(base + "/favicon.ico")).status, 200);
assert.equal((await fetch(base + "/og-image.webp")).status, 200);
console.log("Busca, filtros, vazio, 301, sitemap, robots e favicon — OK");

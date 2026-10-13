# Simplificação comercial e navegação — 2026-10-13

Branch: `codex/site-config-navigation`, retomada a partir da implementação atual (`d3f8a30`), que também estava na main. Sem merge, PR, push ou deploy remoto.

## Entrega

- Removidos página, provider, contexto, operações, persistência, tipos, mensagem, componentes e teste exclusivos do carrinho, além dos controles no Header/Footer/produto. Cards já eram links para o produto. Nenhuma dependência era exclusiva desse fluxo; package.json e lockfile permanecem iguais.
- `/carrinho/` retorna 301 para `/produtos/` pela camada central de redirects. `/carrinho` preserva a normalização global TanStack (307 para a variante com barra), seguida do 301; outras regras de URL não mudaram.
- `NavigationDropdown` substitui `ProductsDropdown` e atende Produtos/Empresa em desktop/mobile. Categorias vêm das taxonomias já paginadas pela camada REST real, sem nova consulta no componente ou limite de cinco. Irmãos em ordem alfabética/ID, filhos indentados, count zero omitido, tolerância a ciclos/pais ausentes; link geral ao final. O WordPress conta produtos publicados nos termos.
- Empresa apresenta Quem Somos e A Fábrica; conteúdo continua vindo de Pages nativas. Escape fecha primeiro o submenu mobile e restaura seu foco; depois fecha o menu principal e restaura o botão de abertura.
- Home e catálogo geral compartilham BrandSelector com logos normalizados de acf.logo e texto para logo ausente. Catálogo: título, marcas, filtros e resultados. Variante catalog evita wrap duplicado e CTA redundante.
- AGENTS.md, project.md e architecture.md registram o fluxo exclusivo WhatsApp. Relatórios anteriores permanecem como histórico das entregas então validadas.

## Validação

- `pnpm typecheck`: passou.
- `pnpm lint`: passou.
- `pnpm test`: 90 testes em nove arquivos, passou sem atualização no último run. Novos testes cobrem mais de cinco categorias, hierarquia, vazios, ciclos/pais ausentes, URLs de Empresa e fallback de marca sem logo.
- 19 snapshots atualizados para alterações visuais/funcionais solicitadas; dois cenários obsoletos de carrinho removidos. Não foi uma refatoração com obrigação de preservar o HTML alterado por este pedido.
- `pnpm build`: client e SSR/Cloudflare Workers passaram. Primeira execução produziu aviso de permissão ao gravar log global; repetição com WRANGLER_LOG_PATH em artifacts terminou sem esse erro. Preview Workers fora do sandbox porque o inspector local era bloqueado por EACCES; sem alterações de segurança do sistema.
- `TEST_BASE_URL=http://127.0.0.1:4181 pnpm test:ssr`: 21 rotas com WordPress real, incluindo A Fábrica; canonical, OG/Twitter, H1 único, 404, busca/filtros, vazio, paginação real, redirect de produto e carrinho, sitemap, robots e favicon passaram.
- Busca estática no src: única referência restante a carrinho é a regra de redirect; nenhum cart/Cart/localStorage ou import obsoleto. Sitemap não inclui carrinho. Não há CTA ou ícone de carrinho nos HTMLs verificados.
- Navegador: categorias reais (Capota de Fibra; Acessórios count zero omitido), submenu Empresa, Tab/links, Escape/foco, clique fora e ambos os submenus mobile verificados. Seletor real com 13 marcas na Home e catálogo. Comprar agora mantém nome, CFF-01 e URL canônica codificados na URL WhatsApp; nenhuma mensagem enviada.
- Catálogo em 375, 768, 1024 e 1440 px sem overflow horizontal (scrollWidth = clientWidth). Home/produto também conferidos em 375 px. Inspeção visual desktop/mobile aprovada; sem erros/warnings de console nas telas conferidas. Foco visível usa CSS global existente.
- `git diff --check`: passou. CSVs locais preexistentes preservados fora do commit.

## Limites

Não executado deploy remoto, auditoria completa de acessibilidade ou toque em aparelho físico. Hierarquias profundas e marcas sem logo cobertas com dados sintéticos apenas nos testes; CMS real atualmente fornece duas categorias e 13 logos. Build e runtime local validam o target Workers.

## Arquivos alterados/removidos

M	AGENTS.md
M	docs/architecture.md
M	docs/project.md
D	src/components/cart/CartItem.tsx
D	src/components/cart/CartProvider.tsx
D	src/components/cart/CartSummary.tsx
D	src/components/cart/CartView.tsx
M	src/components/home/BrandSelector.tsx
M	src/components/layout/Footer.tsx
M	src/components/layout/Header.tsx
M	src/components/layout/MobileMenu.tsx
D	src/components/layout/ProductsDropdown.tsx
M	src/components/layout/SiteLayout.tsx
M	src/components/products/ProductActions.tsx
M	src/components/site.tsx
D	src/lib/cart/context.ts
D	src/lib/cart/state.ts
M	src/lib/navigation.ts
M	src/lib/seo.ts
M	src/lib/site/legacy-redirects.ts
M	src/lib/site/resolve-route.ts
M	src/lib/whatsapp.ts
D	src/pages/Cart.tsx
M	src/pages/Catalog.tsx
M	src/routes/__root.tsx
M	src/routes/robots[.]txt.ts
M	tests/__snapshots__/render-regression.test.tsx.snap
D	tests/cart.test.ts
M	tests/domain.test.ts
M	tests/render-regression.test.tsx
M	tests/ssr.mjs
A src/components/layout/NavigationDropdown.tsx
A tests/navigation.test.tsx
A docs/commercial-navigation-validation.md

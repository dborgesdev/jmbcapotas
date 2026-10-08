# Configuração CMS e ajustes de navegação — 08/10/2026

Branch: `codex/site-config-navigation`, criada a partir da main no commit `50cd254`, que já contém os redirecionamentos aprovados. Sem merge, PR ou publicação.

## Resultado e decisões

- Registro real confirmado via REST: `site-config`, ID 874, slug `jmb-capotas`; ambas as imagens apontam atualmente para media 875. Dados normalizados e distribuídos por contexto React leve, sem nova consulta para identificar produto/marca.
- Cache de configuração normalizada por 60 segundos e deduplicação de consultas concorrentes. Falha retorna configuração vazia, cacheada por 10 segundos para evitar repetição imediata; imagens ausentes ficam em fundo neutro e contatos/condições ausentes são omitidos.
- Telefone e WhatsApp independentes, normalização brasileira sem duplicar 55, links tel/wa.me e mensagens por contexto centralizados. Comprar agora e carrinho preservam sua intenção específica.
- Parcelamento exclusivamente do CMS: menos de 2, fracionário/ inválido/ ausente é omitido; somente boolean true autoriza “sem juros”.
- Cinco marcas do dropdown em ordem alfabética por nome da taxonomia, desempate por ID. Nenhum ranking comercial presumido. Produtos geral segue acessível; Galeria preserva `/trabalhos/`.
- Hero da Home e CTA final têm mídias independentes. Vídeo e componente antigo removidos do fluxo e do build. Imagens decorativas com alt vazio; Hero priorizado e backgrounds com sizes 100vw.
- Hero da marca fora do container, conteúdo alinhado pelo wrap. Esta composição evita overflow causado por 100vw incluir a barra de rolagem. Sem imagem, preserva CatalogHeader. Troca de marca via TanStack Router mantém busca/categoria válida, limpa modelo incompatível e paginação.
- Footer usa dados CMS e restaura “Feita para acompanhar você.”; links externos em nova aba com noopener noreferrer. Rodapé reserva espaço para o botão flutuante em mobile.
- Layout público e páginas de erro/404 recebem configuração e WhatsApp flutuante. Rotas públicas e regras de redirects não foram alteradas.

## Validações executadas

- `pnpm typecheck`: aprovado.
- `pnpm lint`: aprovado.
- `pnpm test`: 93 testes aprovados em 9 arquivos. Inclui 27 cenários novos de contatos/configuração/parcelamento/mensagens/filtros e 4 de apresentação SSR.
- `pnpm build`: aprovado, client e SSR Cloudflare Workers; sem vídeo ou background local da Home no bundle.
- `pnpm test:ssr`: aprovado no desenvolvimento e no preview de produção Workers (porta 3001), consultando WordPress real. 21 URLs, status 200/404, único H1, canonical, OG/Twitter, filtros/busca, alias 301, sitemap, robots e favicon.
- Navegador: dropdown desktop por clique/Enter, Escape, clique fora e seleção; submenu mobile, seleção de marca, busca/categoria preservadas, URL histórica sem barra duplicada e contexto atualizado.
- Home/CTA/Footer, marca com imagem, produto, pronta entrega, carrinho e 404 conferidos no navegador. Mensagens de produto incluem código CFF-01/URL; mensagem própria do carrinho mantém quantidades/código/URL. Item de teste removido ao terminar.
- Responsividade em 375, 768, 1024 e 1440 px; largura scroll igual à largura útil nas páginas verificadas após correção. Imagens/overlays, foco visível, botões touch e leitura do Footer inspecionados. Sem warnings/erros de console nas telas verificadas.
- Marca sem imagem, contatos ausentes, mídia independente e condições de parcelamento com/sem juros cobertos por renderização SSR unitária; indisponibilidade do endpoint coberta com fetch rejeitado.
- 21 snapshots atualizados para as mudanças visuais/funcionais solicitadas, após verificações específicas de comportamento e inspeção da apresentação. Não se trata de atualização para mascarar refatoração que deveria preservar markup.
- `git diff --check`: aprovado; arquivos de redirect, mapa legado, classificação de URLs de produto e `docs/seo-migration.md` preservados. CSVs locais preexistentes não integram o commit.

## Arquivos alterados

Integração/regras:
`src/lib/wordpress/site-config.ts`, `src/lib/wordpress/public-config.ts`, `src/lib/contacts.ts`, `src/lib/payment.ts`, `src/lib/whatsapp.ts`, `src/lib/config.ts`, `src/lib/navigation.ts`, `src/lib/site/config-context.tsx`, `src/lib/site/brand-search.ts`, `src/lib/site/context.ts`, `src/lib/site/types.ts`, `src/lib/site/resolve-route.ts`, `src/routes/__root.tsx`.

Componentes:
`src/components/layout/Header.tsx`, `MobileMenu.tsx`, `ProductsDropdown.tsx`, `Footer.tsx`, `FooterContacts.tsx`, `SiteLayout.tsx`;
`src/components/home/HeroSection.tsx`, `FinalCta.tsx`, `InstitutionalSection.tsx`, `HeroVideo.tsx` (removido);
`src/components/catalog/BrandHero.tsx`, `CatalogFilters.tsx`, `CatalogLayout.tsx`;
`src/components/common/FloatingWhatsApp.tsx`, `WhatsAppLink.tsx`, `EmptyState.tsx`, `Picture.tsx`, `SiteStructuredData.tsx`;
`src/components/products/PaymentConditions.tsx`, `ProductActions.tsx`;
`src/components/cart/CartSummary.tsx`.

Páginas:
`src/pages/Home.tsx`, `Brand.tsx`, `Article.tsx`, `City.tsx`, `Work.tsx`, `WordPressPage.tsx`, `NotFound.tsx`, `ErrorView.tsx`.

Testes/documentação:
`tests/site-config.test.ts`, `tests/config-render.test.tsx`, `tests/domain.test.ts`, `tests/refinements.test.tsx`, `tests/render-regression.test.tsx`, `tests/__snapshots__/render-regression.test.tsx.snap`;
`docs/wordpress-content-model.md`, `docs/architecture.md`, `docs/project.md`, este relatório.

## Limites e pendências

Sem pendências funcionais identificadas nas verificações realizadas. Deploy remoto não executado; o target foi validado por build e preview local do runtime Workers. A inspeção de acessibilidade foi funcional/manual, não uma auditoria certificada de todas as páginas.

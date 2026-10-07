# Refinamento da V1 — 2026-10-07

Branch: feat/v1-site. Sem merge, PR, deploy ou dependências adicionais.

## Entrega

- Logo real no Header/Footer; Início em desktop/mobile; retorno suave ao topo da Home e Header fixo com contraste após scroll, reserva de altura e offset para anchors.
- Vídeo local existente no Hero, autoplay/muted/loop/playsInline/object-cover. Fallback real estático no SSR, quando a preferência é reduced motion ou o vídeo falha/não começa a tocar.
- Eyebrows normalizados estruturalmente por Eyebrow; headings sem ponto ornamental, inclusive no HTML editorial sanitizado.
- Carrossel de categorias com imagem grande, próximo card parcial, controles, indicadores, teclado e rolagem touch nativa com CSS snap. Card usa acf.imagem; Hero da categoria usa acf.imagem_fundo.
- Quem Somos com featured_media e introdução derivados da Page nativa; marquee com os 11 clientes publicados e logos resolvidos pela camada WordPress.
- Catálogo/marcas com linguagem abrangente; descrição nativa da marca e introduções editoriais/fallback contextual.
- Relacionados por marca + modelo, complementados por genéricos sem marca, excluindo o atual e veículos incompatíveis; máximo quatro. Genéricos são paginados no servidor, resolvendo mídia somente dos selecionados.
- Blocos próprios de pronta entrega e parcelamento; crédito discreto com Smart Local externo protegido.
- SSR, SEO, URLs históricas, API, filtros, galeria, carrinho e WhatsApp preservados. Home continua sem produtos em destaque. A regra de componentização permanente já existe em AGENTS.md e foi preservada.

## Decisões técnicas

- React/CSS nativos para o carrossel e marquee; nenhuma biblioteca nova.
- Logo sobre base clara discreta para manter legíveis os traços pretos do arquivo real em fundos escuros.
- useSyncExternalStore verifica a preferência de movimento antes de montar o vídeo; SSR não antecipa o download do MP4. Nenhuma duplicação do vídeo fonte.
- Introdução normalizada a partir do primeiro parágrafo editorial substancial, preferindo uma frase completa; não depende de excerpt nem de campo novo no CMS.
- Contrato de cliente restrito a id, title e featured_media. Sem destinos presumidos para links.
- Timeout de testes ajustado para 15s: a importação inicial da árvore TanStack no Windows ultrapassou 5s ao rodar os checks em paralelo; não houve mudança no timeout REST de produção.
- Referência dos 21 snapshots atualizada porque esta rodada autoriza mudança visual; futuros trabalhos puramente estruturais devem preservá-la.

## Validações finais

| Comando | Resultado |
| --- | --- |
| pnpm typecheck | Passou |
| pnpm lint | Passou |
| pnpm test | 54 testes em 6 arquivos; todos passaram, sem atualizar snapshots |
| pnpm build | Build client + SSR/Cloudflare Workers passou |
| TEST_BASE_URL=http://127.0.0.1:4181 pnpm test:ssr | 21 rotas com WordPress real passaram; canonical, OG/Twitter, H1 único, 404, busca/filtros/vazio, 301, sitemap, robots e favicon passaram |
| git diff --check | Passou |

Navegador: desktop, 768×1024 e 390×844; Header fixo/contraste, menu mobile, logo/Início, vídeo tocando sem som, controles/indicadores do carrossel, campos de imagem da categoria, Quem Somos, 11 logos carregados, marca/descrição, busca+marca+modelo, produto/galeria, pronta entrega, pagamento, adição/persistência/remoção do carrinho, URL e mensagem WhatsApp e crédito do Footer conferidos. Não foi enviada mensagem. Sem overflow horizontal nas telas verificadas, headings finais com ponto ou erros relevantes de console.

Reduced motion: fallback SSR testado, carregamento condicionado à preferência no cliente e CSS que interrompe marquee/transições; a superfície de navegador disponível não oferece emulação de prefers-reduced-motion. Gesto touch em dispositivo físico não foi exercitado; usa rolagem horizontal nativa.

## Conteúdo/asset

Todos os assets necessários estão presentes: logo/vídeo local, imagens de card e fundo das duas categorias, featured_media de Quem Somos e logos de clientes. O asset local quemsomos.webp não substitui a imagem institucional publicada.

O WordPress atualmente contém apenas dois produtos, destinados a veículos diferentes, e nenhum produto genérico sem marca. Portanto a seção de relacionados fica ausente nesses produtos, conforme a regra solicitada. Acessórios ainda não possui produtos. Descrições vazias de marcas/categorias usam o fallback editorial definido no frontend.

## Execução local

- pnpm install
- pnpm dev
- Produção: pnpm build; pnpm preview --port 4181 --host 127.0.0.1
- Preview mantido em http://127.0.0.1:4181/
- Evidências locais (ignoradas pelo Git): artifacts/refinement-hero.png, artifacts/refinement-categories.png e artifacts/refinement-home.png.

## Arquivos criados

- src/components/catalog/CategoryHero.tsx
- src/components/common/Eyebrow.tsx
- src/components/home/CategoryCard.tsx
- src/components/home/ClientsMarquee.tsx
- src/components/home/HeroVideo.tsx
- src/components/layout/Logo.tsx
- src/components/products/PaymentConditions.tsx
- src/components/products/ProductAvailability.tsx
- src/lib/home-navigation.ts
- src/lib/site/introduction.ts
- src/lib/text.ts
- src/lib/use-reduced-motion.ts
- src/lib/wordpress/clients.ts
- src/lib/wordpress/related.ts
- tests/refinements.test.tsx
- docs/refinement-validation.md

## Arquivos alterados/removidos

- docs/architecture.md
- docs/wordpress-content-model.md
- src/components/blog/PostCard.tsx
- src/components/cart/CartView.tsx
- src/components/catalog/CatalogFilters.tsx
- src/components/catalog/CatalogHeader.tsx
- src/components/common/EditorialHeader.tsx
- src/components/home/BlogSection.tsx
- src/components/home/BrandSelector.tsx
- src/components/home/CategorySection.tsx
- src/components/home/FinalCta.tsx
- src/components/home/HeroSection.tsx
- src/components/home/InstitutionalSection.tsx
- src/components/home/WorksSection.tsx
- src/components/layout/Footer.tsx
- src/components/layout/Header.tsx
- src/components/layout/MobileMenu.tsx
- src/components/layout/Wordmark.tsx (removido; substituído por Logo)
- src/components/products/ProductActions.tsx
- src/components/products/ProductCard.tsx
- src/components/products/ProductInfo.tsx
- src/components/products/RelatedProducts.tsx
- src/components/works/WorkCard.tsx
- src/lib/navigation.ts
- src/lib/seo.ts
- src/lib/site/home.ts
- src/lib/site/product.ts
- src/lib/site/resolve-route.ts
- src/lib/site/types.ts
- src/lib/wordpress/html.ts
- src/lib/wordpress/normalize.ts
- src/lib/wordpress/products.ts
- src/lib/wordpress/types.ts
- src/pages/Article.tsx
- src/pages/Blog.tsx
- src/pages/Cart.tsx
- src/pages/Category.tsx
- src/pages/Cities.tsx
- src/pages/City.tsx
- src/pages/Home.tsx
- src/pages/NotFound.tsx
- src/pages/WordPressPage.tsx
- src/pages/Work.tsx
- src/pages/Works.tsx
- src/styles/app.css
- tests/__snapshots__/render-regression.test.tsx.snap
- tests/render-regression.test.tsx
- tests/ssr.mjs
- tests/wordpress.test.ts
- vitest.config.ts

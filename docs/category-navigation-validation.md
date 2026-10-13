# Navegação e árvore de categorias — 2026-10-13

Branch: codex/site-config-navigation, continuidade de f9330af. Sem merge, PR, push ou deploy.

## Implementação

- src/lib/categories.ts centraliza categoryTree: cópia ordenada por localeCompare pt-BR/ID, travessia em profundidade, filhos imediatamente após os pais, irmãos alfabéticos e prefixo por nível nos filtros. Não depende de ordem REST/count. Inclui vazios; termos órfãos/cíclicos são preservados uma vez para resiliência.
- src/lib/navigation.ts usa a mesma árvore, seleciona estritamente parent === 0 para o Header e mantém link geral final. Produtos desktop/mobile e Empresa reutilizam o mecanismo anterior sem alteração de eventos.
- src/lib/site/catalog-search.ts calcula o destino de Buscar: categoria individual usa /produtos/{slug}/ ou /produtos/ para Todas; marca, catálogo geral e pronta entrega conservam a rota. Busca é preservada, marca deve existir e modelo deve corresponder à marca; paginação é removida. Categoria definida na rota não é duplicada na query.
- src/components/catalog/CatalogFilters.tsx habilita categoria em páginas individuais e submete via TanStack Router. Estado inicial continua priorizando categoryId da URL; a composição existente remonta a página ao trocar rota/search. Todas as barras compartilhadas usam a árvore completa com prefixos por profundidade.
- AGENTS.md e documentos funcionais/arquiteturais atualizados; sem alteração CMS/ACF, dependências ou outras regras de URL.

## Validação

- pnpm typecheck e pnpm lint: passaram.
- pnpm test: 99 testes em dez arquivos passaram no último run, sem atualização. Sete novos testes cobrem ordem pt-BR, irmãos, profundidade adicional, vazios, ciclos/órfãos, select habilitado e categoria da rota, troca para subcategoria, Todas, mesma categoria, busca/marca/modelo compatíveis, inválidos, remoção da paginação e rotas de marca/catálogo/pronta entrega. Testes do Header atualizados para somente parent === 0.
- Snapshot apenas do cenário categoria atualizado pela remoção do disabled solicitada; outros 18 hashes permaneceram iguais.
- pnpm build: client + SSR/Cloudflare Workers passaram, com log em artifacts dentro do workspace.
- TEST_BASE_URL=http://127.0.0.1:4181 pnpm test:ssr: 21 rotas reais, canonical/OG/Twitter/H1, 404, filtros/busca, vazio, paginação, redirects, sitemap/robots/favicon passaram.
- Navegador: ordem real Todas, Acessórios, — Fechadura, Capota de Fibra, Capotas Marítimas em Lona, Tampão Marítimo em Fibra. Fechadura permaneceu nos filtros e não aparece no Header. Categorias principais vazias presentes e link geral ao final, desktop e mobile.
- A partir de Capota de Fibra pagina=2, seleção de Fechadura + busca Strada + Fiat + Strada 2020-26 levou a /produtos/fechadura/ com busca/marca/modelo preservados e sem paginação. Recarga confirmou H1, categoria selecionada e canonical da nova rota. Todas levou a /produtos/ preservando os mesmos filtros e canonical correto.
- Marca Fiat: Buscar com categoria Fechadura, busca Strada e modelo compatível manteve URL pública da marca, com categoria/modelo na query. Select ordenado e dependência de modelo preservados. Sem warnings/erros de console nas telas verificadas.
- Página de categoria em 375/768/1024/1440 px sem overflow horizontal: scrollWidth = clientWidth. Teclado/abertura mobile/Escape do Header conferidos; código de hover/clique permanece intacto.
- git diff --check passou. CSVs não rastreados preexistentes preservados fora do commit.

## Arquivos

Criados: src/lib/categories.ts; src/lib/site/catalog-search.ts; tests/category-filters.test.tsx; este relatório.

Modificados: src/components/catalog/CatalogFilters.tsx; src/lib/navigation.ts; tests/navigation.test.tsx; tests/__snapshots__/render-regression.test.tsx.snap; AGENTS.md; docs/project.md; docs/architecture.md.

Preview Workers local validado; sem deploy remoto ou teste touch físico. Múltiplos níveis/ciclos cobertos com dados sintéticos nos testes, não conteúdo inserido no WordPress.

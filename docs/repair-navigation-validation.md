# Header e trabalhos na Page de conserto — 2026-10-13

Branch: codex/site-config-navigation, continuidade de 31cccfe. Sem merge, PR, push ou deploy.

## Alterações

- Navegação compartilhada: Início, Produtos, Conserto de Capotas, Empresa, Galeria, Blog, Contato. Conserto é link independente para /conserto-de-capotas-de-fibra/, inclusive no mobile. Botão Fale com a JMB preservado na posição atual.
- Produtos: Pronta entrega (/pronta-entrega/) primeiro; divisor antes da primeira categoria; categorias principais parent === 0 em ordem pt-BR, inclusive vazias; divisor e Ver todos os produtos ao final. Nenhuma subcategoria ou consulta nova.
- site/pages resolve a Page nativa por slug, aproveitando conteúdo normalizado já carregado pelo contexto e consulta por slug como fallback. Somente a Page conserto-de-capotas-de-fibra recebe trabalhos recentes.
- site/works.recentWorks é compartilhado com a Home e usa a consulta REST existente de três trabalhos, com cache/deduplicação do transporte. Falha retorna lista vazia sem derrubar o conteúdo institucional.
- WordPressPage compõe WorksSection depois do article com conteúdo/CTA e antes do Footer, fora do wrap do article para preservar a seção full-width da Home. Componente e estilos de WorksSection permanecem intactos; ausência de trabalhos omite a seção. Demais Pages não a recebem.
- Corrigido deslocamento de links mobile ao tocar em Conserto com Produtos expandido: fechar o disclosure em pointerdown/blur movia o link antes do clique terminar. No mobile, fechamento externo ocorre em click e blur entre elementos do mesmo menu não colapsa antecipadamente. Desktop conserva pointerdown, hover e fechamento por saída. Ao abrir Empresa, Produtos fecha depois que o clique chega ao botão correto; Escape/foco preservados.

## Validação final

| Check | Resultado |
| --- | --- |
| pnpm typecheck | Passou |
| pnpm lint | Passou |
| pnpm test | 104 testes em 11 arquivos; último run sem atualização |
| pnpm build | Client + SSR/Cloudflare Workers passaram |
| TEST_BASE_URL=http://127.0.0.1:4181 pnpm test:ssr | 22 rotas com CMS real e SEO/404/filtros/paginação/redirects/sitemap/robots/favicon passaram |
| git diff --check | Passou |

Testes específicos verificam ordem da navegação, Pronta entrega primeiro, divisor, categorias principais/vazias, Page reaproveitada sem consulta duplicada, uma consulta paginada de trabalhos, mesmo HTML de WorksSection, conteúdo anterior à seção, links, ausência em outras Pages, lista vazia/falha de API e fallback/404 de Page.

19 hashes agregados atualizados pela alteração autorizada do Header em todas as páginas. Não houve mudança nos componentes/seções da Home; comparação no navegador confirmou outerHTML idêntico da seção de trabalhos entre Home e conserto, com os dois trabalhos publicados. O teste de Page confirma inclusão literal do HTML do componente compartilhado.

Navegador:

- Header/dropdown na ordem solicitada; Pronta entrega não é item principal, Conserto é independente; categorias principais ordenadas e sem Fechadura, link geral final e separadores.
- Hover abre Produtos; passagem ao painel mantém aberto; saída fecha; Tab alcança Pronta entrega; Escape restaura foco. Empresa mantém Quem Somos/A Fábrica e teclado. Mobile expansível e clique em Conserto com Produtos aberto abre destino correto; trocar de Produtos para Empresa fecha o anterior; Escape mantém foco no botão Empresa.
- Header sem sobreposição entre logo, nav e ações e sem overflow em 375, 768, 1024, 1280 e 1440px; scrollWidth = clientWidth.
- Page de conserto mostra conteúdo, featured_media, breadcrumbs e título reais do CMS, seguida por Na prática/Da escolha à estrada/cards/Ver trabalhos e Footer. Card Reparo Capota de Fibra XYZ abriu sua Page individual. Seção visual idêntica à Home; Quem Somos sem seção adicional.
- Canonical, H1 único, metadados e HTTP 200 da Page de conserto validados em SSR. Redirects e seo-migration.md não modificados.

Build com WRANGLER_LOG_PATH em artifacts; preview Workers local fora do sandbox para conexões do inspector conforme autorização anterior. Sem teste touch em aparelho físico, auditoria certificada de acessibilidade ou deploy remoto. Falha/lista vazia do CPT cobertas por mocks nos testes; nenhuma alteração no WordPress ou dependência nova.

## Arquivos

Criados: src/lib/site/pages.ts, tests/repair-page.test.tsx e este relatório.

Modificados: src/lib/navigation.ts, src/components/layout/NavigationDropdown.tsx, src/lib/site/home.ts, src/lib/site/works.ts, src/lib/site/resolve-route.ts, src/pages/WordPressPage.tsx; tests/navigation.test.tsx, tests/ssr.mjs, tests/__snapshots__/render-regression.test.tsx.snap; AGENTS.md, docs/project.md, docs/architecture.md.

CSVs locais não rastreados preservados fora do commit.

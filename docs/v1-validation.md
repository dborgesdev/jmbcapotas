# Entrega V1 — 7 de outubro de 2026

Implementação em `feat/v1-site`; sem alterações na main, merge, PR ou publicação em produção.

## Escopo

Home com Hero de fotografia real, marca imediatamente abaixo, categoria editorial, bloco institucional resiliente, trabalhos e CTA. Header/footer, catálogo paginado com busca e Categoria → Marca → Modelo, marcas/modelos, categorias hierárquicas, detalhes e galeria de produto, pronta entrega, carrinho persistente e WhatsApp, trabalhos/relacionamentos, cidades, Pages e blog/artigos/categorias. SSR, metadata/canonical/OG/Twitter, sitemap dinâmico, robots, favicon e dados estruturados verificáveis. HTML do CMS sanitizado no servidor.

## Decisões técnicas dentro da arquitetura aprovada

- A classificação histórica usa o termo real `capota-de-fibra`, seus descendentes e associação a modelo. Não usa substring do título. Categorias têm prioridade na resolução `/produtos/{slug}/`; o CMS deve evitar slugs idênticos de categoria e produto fora da classificação histórica.
- A REST padrão não filtra o booleano ACF `pronta_entrega`. Somente essa coleção percorre páginas da API no servidor e aplica o booleano, com cache de 60 segundos. O navegador recebe uma página de 12 resultados. O catálogo geral utiliza paginação e filtros REST diretamente. Não houve extensão do CMS nem dependência de ACF Pro.
- Modelos são filtros da página da marca e não têm rota indexável independente. Consultas/filtros e carrinho recebem noindex; sitemap inclui somente URLs canônicas sem parâmetros.
- Timeout de 10 segundos, cache público em memória do isolate e deduplicação de consultas simultâneas. Falhas de mídia, posts da Home, trabalhos da Home, categorias do blog e produtos relacionados não derrubam o conteúdo principal. Falha do catálogo apresenta erro com tentativa novamente; não é mascarada como ausência de produto.
- Vite alinhado ao plugin React atual; configuração oficial de Workers com `nodejs_compat`. Não há servidor Node customizado.
- Sem asset oficial de logo JMB na API, o header usa o nome tipográfico da marca; favicon é uma marca tipográfica simples. Substituir pelos arquivos oficiais quando fornecidos.

## Conteúdo disponível na auditoria

Um produto (CFF-01), uma marca (Fiat), um modelo (Strada 2020-26), uma categoria (Capota de Fibra), um trabalho, Curitiba e cinco mídias. Não havia Pages nem Posts publicados.

Pendências editoriais/assets:

- Publicar Pages institucionais e Contato com slugs históricos e conteúdo aprovado. A implementação já consome esses slugs; sem registro real a resposta é 404. Empresa leva ao bloco institucional da Home enquanto a Page não existe; Contato leva ao WhatsApp confirmado.
- Publicar artigos para avaliar índice/categorias/artigo com conteúdo real. A Home omite o bloco quando não há posts; o blog tem estado vazio.
- Cadastrar demais marcas, modelos, categorias e produtos. Imagens/imagens de fundo da categoria e marca atual estão vazias. A seção editorial usa fotografia real do produto da categoria.
- Não havia vídeo de Hero nem fotografia panorâmica de campanha: o Hero usa a foto real disponível. As fotos de produto/trabalho têm até 900 px e limitam nitidez em telas grandes.
- Revisar o trabalho publicado com título “Instalação Capota de Fibra Empresa XYZ” e texto genérico no CMS. Foi exibido como publicado, sem inventar cliente ou descrição substituta.
- Disponibilizar logo e favicon oficiais. Não foram criadas imagens falsas de produtos, veículos, instalações ou equipe.

## Validações

`pnpm typecheck`, `pnpm lint` e `pnpm build` passaram. `pnpm test`: 12 testes passaram em duas suites. Domínio/REST cobre URLs, hierarquia, segurança HTML, filtros numéricos, WhatsApp, cache/deduplicação, paginação, mídia ausente, galeria ACF e Pages. `pnpm test:ssr`: 17 rotas/status passaram no bundle de produção, além de busca/filtros/vazio, 301, sitemap, robots e favicon; verificados metadata, canonical e único H1. Avaliação visual e funcional no navegador incluiu 375/768/1024/1440 px sem overflow horizontal, menu/teclado, foco visível, galeria e carrinho com quantidade/persistência/remoção e URL do WhatsApp. Console da Home de produção sem erros ou avisos. Captura visual local em `artifacts/screenshots/home-desktop.jpg` (ignorada pelo Git).

Build, execução do bundle no emulador Workers e `wrangler deploy --dry-run` validam o target localmente. Vinculação à conta Cloudflare, domínio e validação na infraestrutura de produção permanecem para a etapa de deploy; não foram publicados nesta entrega.
# Refatoração estrutural da V1 — 2026-10-07

- Branch: `feat/v1-site`; sem merge ou PR nesta rodada.
- `components/site.tsx` reduzido a dispatcher/composição; `layout.tsx`, `cart.tsx` e `wordpress/content.ts` substituídos por módulos próprios. `wordpress/site.ts` só expõe a server function.
- Regra permanente de decomposição adicionada ao `AGENTS.md`, com responsabilidades registradas em `architecture.md`.
- 46 testes: 21 comparações exatas de HTML com a V1 anterior, 10 cenários de resolução SSR/REST (incluindo Page e artigo), 3 cenários de carrinho e 12 testes existentes de REST/domínio/WhatsApp.
- Typecheck, lint e build de produção Cloudflare aprovados.
- Suíte SSR com REST real: 17 URLs/status, busca/filtros, vazio, redirect 301, sitemap, robots e favicon aprovados na execução completa final.
- Navegador: marca/modelo/busca, troca de foto, adição ao carrinho, quantidade, persistência após reload, remoção, menu mobile/Escape e mensagem/URL de WhatsApp conferidos. Nenhuma mensagem foi enviada pelo WhatsApp.
- Desktop 1440, tablet 768 e mobile 375 conferidos; sem alteração intencional de markup ou classes e sem overflow horizontal nas telas verificadas. Console da aba de validação sem erros/warnings.
- Houve respostas intermitentes 503 no sitemap e 500 em categoria durante validações anteriores; ambas voltaram a responder 200, e a suíte completa passou. A causa dessas ocorrências não foi confirmada; transporte/cache não foi alterado nesta refatoração.
- WordPress consultado ainda sem Pages/posts publicados; seus cenários são cobertos por testes isolados. Assets locais não rastreados existentes foram preservados fora do commit da refatoração.

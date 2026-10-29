# Otimização REST, mídia e SEO — 29/10/2026

> Registro da etapa REST, anterior à auditoria de CPU. As medições e hashes abaixo pertencem àquela etapa. A orientação posterior do usuário autorizou consultar somente quatro cidades na origem; o estado final e novas correções estão na [auditoria do Worker](performance/cloudflare-worker-audit.md).

Branch local: `codex/jmb-rest-performance`. Base: `e93edf4` (também confirmada como HEAD da main remota por `git ls-remote`). Checkout inicialmente limpo. Sem commit, push, PR, merge, deploy ou escrita no WordPress.

## Diagnóstico e decisão nativa

Foram consultados os dez endpoints solicitados com resposta normal, `acf_format=standard`, embed de imagem destacada e combinação. Também foram consultadas as coleções completas das três taxonomias, o site-config publicado e produto/trabalho com galeria, usando `_embed` completo. Evidências: [matriz dos endpoints](performance/native-endpoints.json) e [campos preenchidos/embeds completos](performance/native-acf-detail.json). Valores e tamanhos são respostas públicas reais; não são fixtures.

| Conteúdo | `acf_format=standard` observado | Decisão |
| --- | --- | --- |
| produto/trabalho, galeria ACF preenchida | URL ou false; não fornece alt/dimensões/sizes | Manter IDs e resolver lotes na REST nativa |
| marca, logo/fundo | URL ou false | Manter IDs; lote com metadados completos |
| categoria_produto, imagem/fundo | URL | Manter IDs; lote com metadados completos |
| modelo, imagem | URL ou false; `acf.marca` passa de ID a objeto/false | Manter formato original para preservar dependência marca/modelo |
| site-config, hero/final_cta | URL; telefone e parcelamento também passam a strings | Manter formato original, cache e deduplicação por attachment |
| cliente/pages/posts/cidade | Não enriquece imagem destacada | Usar `_embed=wp:featuredmedia` nas consultas que normalizam conteúdo |

`_embed` completo não forneceu as imagens ACF. Expandiu relações de termos, pais e posts desnecessários. Em trabalho, `acf_format=standard` também transforma `acf.produto` de IDs em objetos WordPress inteiros. Não ativamos esse parâmetro: usar URLs isoladas perderia metadados e as relações/configuração exigiriam conversões sem benefício de mídia suficiente. Nenhum campo ACF foi alterado no painel.

A solução utiliza exclusivamente recursos já existentes:

- `_embed=wp:featuredmedia` nas coleções de conteúdo renderizado e clientes. Não é inserido indiscriminadamente no transporte, taxonomias, site-config, varreduras de pronta entrega/relacionados ou sitemap.
- `/media?include=…&per_page=100&_fields=id,source_url,alt_text,media_details` para dois ou mais IDs não resolvidos de cada conjunto. IDs ordenados/deduplicados tornam a chave de cache estável. Lotes de até 100, processados sequencialmente, evitam rajadas.
- Objetos completos já retornados pelo WordPress ou arrays ACF são normalizados diretamente. Nenhuma consulta extra quando são suficientes. URLs isoladas não são tratadas como metadados completos.
- Um ID isolado mantém a consulta individual e seu cache original. A configuração atual usa o mesmo attachment no Hero e CTA; isso resulta em uma única consulta de mídia por carregamento frio.
- Imagem ausente na coleção é omitida; falha/malformação da coleção preserva o fallback individual. A galeria mantém ordem e deduplicação. São preservados todos os slots que o código vigente consumia; a API real de produto contém também `imagem_6` a `imagem_10`.
- `_embedded` é removido do objeto público normalizado para não transportar dados brutos adicionais ao navegador. Componentes React não fazem consultas de mídia.

Não há arquivo PHP nesta entrega. O rascunho local iniciado antes da correção de diretriz foi retirado. Não há instalação, migração de CMS ou aprovação de PHP pendente.

## Medições

As tabelas por rota, cache, endpoint, bytes e renderização estão em [resultados](performance/results.md). Os logs completos com parâmetros ordenados e duração de cada chamada estão em [antes](performance/before.json) e [depois](performance/after.json).

Metodologia: Node 22.16.0/Vitest local, REST pública real, mesmas 13 URLs, cada rota com módulos/cache reiniciados e chamada quente imediatamente seguinte. A linha de base lê os módulos originais do Git em diretório ignorado, sem modificar o checkout. O único acréscimo à cópia original é o mesmo observador de contadores do transporte. As execuções finais antes/depois são sequenciais, sem lint/typecheck/testes concorrentes. Cache frio significa cache em memória do frontend vazio; não significa cache da hospedagem/CDN vazio.

Bytes são tamanho UTF-8 do JSON descomprimido efetivamente lido, somados inclusive às consultas de mídia; não são bytes comprimidos na rede. O tempo por endpoint inclui leitura do corpo. O tempo dos dados mede o loader inteiro, sem transformar cache HIT em chamada HTTP. `componentSsrMs` mede `renderToStaticMarkup(SiteView)` com os dados reais; não inclui o documento TanStack, hidratação ou TTFB completo do Worker. O hook de navegação tem o mesmo shim da suíte de regressão estática. A primeira renderização pode incluir aquecimento do React/JIT. Latências são amostras pontuais, não medianas nem garantia de produção.

Os hashes comparam o HTML completo renderizado e o conteúdo público normalizado (apenas as quatro cidades do rodapé fora de /cidades/), configuração, taxonomias, imagens (incluindo srcSet/alt/dimensões/ordem), clientes, paginação e relacionados. Todos os hashes de dados públicos e de HTML devem coincidir para gerar o relatório. As verificações HTTP SSR usam o servidor local Cloudflare/TanStack com a API real, sem mock de conteúdo.

## Contexto global e coleções

- `siteContext`: Pages alimentam navegação/rodapé, conteúdo institucional da Home e reutilização por slug. Cidades alimentam quatro links do rodapé. Fora de /cidades/, só a primeira página original é consultada e o contexto recebe seus quatro primeiros Posts; /cidades/ mantém todas as páginas e o sitemap usa allCities independentemente. A tentativa per_page=4 foi rejeitada porque a API real devolveu outra ordem e mudou os links. Manter per_page=100&page=1 preservou a ordem; somente páginas seguintes dispensáveis são evitadas. Nenhum Post parcial foi introduzido.
- `readyProducts`: conserva filtragem estrita `pronta_entrega === true`, filtros REST combinados, ordenação, total e paginação em grupos de 12 no servidor. Só as imagens da página visível são resolvidas em lote. Não existe filtro nativo documentado para esse meta; não foi criado filtro PHP.
- `relatedProducts`: conserva a consulta de compatíveis, seleção aprovada e varredura de genéricos. Resolver um limite arbitrário na origem poderia excluir opções válidas; apenas a resolução de mídia dos selecionados foi agrupada.
- `all`: conserva paginação sequencial. O catálogo real tem 114 produtos, exigindo duas páginas nas varreduras; não há evidência suficiente para introduzir paralelismo adicional contra a hospedagem.
- Home: conserva a consulta de um produto porque o dado já participava da descrição/SEO. A mudança de imagem social da Home usa o asset padrão solicitado; não depende desse produto.

## Cache, atualização e limites de validação

O transporte continua com TTL de 60 segundos, pending por path, timeout de 10 segundos e limite aproximado de 500 entradas. Lotes usam o mesmo transporte. Não foi introduzido segundo cache de attachments, Redis, KV ou serviço adicional. O cache independente de site-config e sua deduplicação continuam presentes. O observador é opt-in, sem logs ativos em produção.

Há quatro camadas distintas: cache de origem do WP REST Cache; memória do processo/isolate do frontend; HTTP/CDN; cache de navegação do TanStack. Cache HIT/pending das tabelas são exclusivamente os contadores do transporte. O cache adicional de site-config pode evitar até a entrada no transporte e não é contado como HIT REST. Os headers públicos amostrados registraram Cloudflare `DYNAMIC`; não comprovam HIT/MISS ou invalidação do WP REST Cache. O tema versionado contém filtro de capacidade desse plugin, mas não revela sua configuração ativa.

Sem autorização para editar o CMS, não foram testadas invalidações reais após troca de attachment, galeria, produto, marca/categoria, contatos, Hero/CTA ou publicação de artigo/trabalho. Os testes locais verificam expiração, concorrência, reutilização e retry, mas não comprovam a política do plugin remoto. Após expiração local, pode persistir conteúdo antigo se a origem continuar servindo cache antigo. Rotas de mídia em lote e variantes `_embed` devem ser incluídas na verificação de invalidação antes da publicação; não há integração PHP customizada exigindo invalidação cruzada adicional.

## SEO e assets

- `/favicon.ico` já estava correto na raiz; foi preservado e o teste legado que verificava `/favicon.svg` foi corrigido. Não há manifest nem outra referência ativa conflitante encontrada.
- Imagem padrão absoluta: `https://jmbcapotas.com.br/og-image.webp`, compartilhada por OG/Twitter. Home não compartilha mais uma imagem incidental de produto.
- Produto, trabalho, artigo e Page com imagem própria preservam sua imagem individual. Sem imagem própria, usam o padrão. `twitter:card` sempre `summary_large_image`.
- Title, descrição, canonical, og:title/description/type/url e regras de noindex dos filtros continuam na camada SEO. URLs públicas e textos editoriais não foram alterados.
- O teste SSR detectou falta de metadados em 404. O fallback no head raiz usa o estado `_notFound`/status da versão instalada do TanStack para emitir metadados e `noindex,follow`, mantendo status HTTP 404. Como o Router reduz os matches de 404 à raiz, o pathname solicitado é preservado em `beforeLoad` para produzir o canonical correto. Os testes verificam uma ocorrência por propriedade e um único favicon no HTML recebido.
- Dimensões do WebP conferidas pelo cabeçalho do arquivo: 627 × 627. Nenhuma dimensão fictícia foi adicionada às metatags. Assets antigos continuam sem referência ativa; os oficiais não foram alterados.

## Arquivos e diff para revisão

Frontend: `wordpress/media.ts` (mídia nativa/lotes/fallback), `normalize.ts` (embed/galeria), `query.ts` e `clients.ts` (embed restrito), `taxonomies.ts` (lotes), `products.ts` (mídia só dos selecionados), `site-config.ts` (objetos completos e deduplicação), `types.ts` (formatos de imagem), `client.ts` (observação opcional), `seo.ts` (imagem padrão/Twitter/404) e `routes/__root.tsx` (fallback 404).

Validação e reprodução: `tests/media-seo.test.ts`, `tests/performance.measure.test.ts`, `tests/ssr.mjs`, `scripts/prepare-rest-baseline.mjs`, `scripts/audit-native-rest.mjs`, `scripts/report-rest-performance.mjs` e os relatórios. Nenhum componente visual, CSS, regra comercial ou dependência foi alterado. Snapshots aprovados permanecem intactos.

Para reproduzir, com acesso à rede:

```powershell
node scripts/audit-native-rest.mjs
node scripts/prepare-rest-baseline.mjs
$env:MEASURE_BASELINE='1'
$env:MEASURE_REST='before'
pnpm exec vitest run tests/performance.measure.test.ts
Remove-Item Env:MEASURE_BASELINE
$env:MEASURE_REST='after'
pnpm exec vitest run tests/performance.measure.test.ts
Remove-Item Env:MEASURE_REST
node scripts/report-rest-performance.mjs
```

Para revisão do diff: `git diff --stat` e `git diff`; os arquivos novos aparecem em `git status --short`. Nenhuma alteração foi staged.

## Validação e rollback

Resultados finais de scripts e inspeção estão em [validação](performance/validation.md). O build usa o adapter Cloudflare existente e gera o Worker em `dist/server`, sem deploy. A compatibilidade de build local não substitui teste no domínio de produção.

Rollback não exige alteração no CMS: preservar o diff desta branch e retornar ao commit base/branch anterior após validação do responsável. Em eventual publicação futura, o frontend anterior continua compatível com a REST inalterada. O fallback individual permanece disponível para falhas de lote e respostas antigas. Não executar reset/clean sobre trabalho local para desfazer a mudança.

# Auditoria do Cloudflare Worker — CPU, memória e erro 1102

Data: 29/10/2026. Branch: `codex/jmb-rest-performance`. Nenhum commit, push, PR, merge, deploy, alteração remota de Cloudflare/WordPress ou instalação PHP.

## Conclusão

**CPU é a hipótese principal, mas o incidente não está classificado de forma definitiva.** O painel informado pelo usuário mostra CPU média de 19 ms, acima do orçamento de 10 ms do Workers Free. O erro 1102 também pode representar memória; é necessário o outcome da invocação para distinguir os dois. Não há registro do evento original disponível nesta auditoria e o usuário informou que o erro ainda não reapareceu após ativar os logs.

Foram confirmados e corrigidos desperdícios de processamento e serialização. A redução de REST anterior foi preservada. A nova implementação passou pelo runtime real `workerd` local com corpus do CMS reproduzido offline, além dos testes do projeto. **Isso não comprova que a CPU de produção ficará abaixo de 10 ms, nem que o 1102 foi corrigido. Não considero comprovadamente seguro o plano Free com as evidências atuais.**

## 1. Evidências do incidente e limites

Informações fornecidas pelo usuário, não obtidas diretamente da conta Cloudflare:

- Domínio `jmbcapotas.com.br`, plano Workers Free.
- Error 1102, Ray ID `a5233e85acc45a8d`, em 29/10/2026 às 15:34:24 UTC / 12:34:24 de Brasília.
- Janela de 24h: aproximadamente 9.440 invocações, 1.050 erros, 19 ms de CPU média, 83.980 subsolicitações e 95,12% de cache HIT de assets.
- Produção tem aproximadamente 15 dias e não contém a otimização REST local. O SHA e o version ID efetivamente publicados não foram fornecidos.

Segundo a [documentação oficial de limites](https://developers.cloudflare.com/workers/platform/limits/), Free tem 10 ms de CPU por requisição, 128 MB por isolate, 50 subsolicitações externas por requisição e seis conexões externas simultâneas. Espera de rede não equivale a CPU. Há tolerância ocasional, mas exceder CPU consistentemente pode encerrar a execução. `exceededCpu` e `exceededMemory` distinguem esses limites em Analytics/Logpush. O limite diário de requisições e o HIT de assets não demonstram conformidade de CPU do SSR.

Os 1.050 erros não podem ser classificados todos como 1102 a partir dos dados agregados. Média de 8,9 subsolicitações por invocação também não exclui páginas frias acima de 50. A versão original ultrapassou esse número nas medições anteriores e no replay local; esse é um risco adicional, cuja mensagem de erro deve ser distinguida do 1102.

## 2. Arquitetura inspecionada

- TanStack Start 1.168.60, React 19.3.0, Vite 8.3.3, Cloudflare Vite plugin 1.62.5 e Wrangler 4.147.0 instalados. O runtime local usa o Miniflare/workerd já instalado, sem dependências adicionais.
- `vite.config.ts` usa `cloudflare({ viteEnvironment: { name: "ssr" } })` e TanStack Start; `wrangler.jsonc` mantém `nodejs_compat`, compatibility date `2026-10-07` e o server entry do TanStack. O build gera `dist/server/index.js` e a configuração do Worker. Nenhum servidor Node foi introduzido como requisito de deploy.
- A raiz carrega a configuração pública. O loader de conteúdo carrega contexto e resolve a rota, reutilizando o cache/pending do mesmo isolate. Site-config também tem cache próprio. Não foi encontrado ciclo de fetch para o próprio domínio ou processamento de pixels de imagens no servidor.
- O cache REST contém respostas JSON por path por 60 segundos, deduplica promises e usa timeout de 10 segundos. O limite de entradas continua aproximadamente 500. Esse cache não é compartilhado entre isolates e não é cache de HTML pronto.
- Respostas quentes anteriormente voltavam a normalizar HTML, montar objetos e serializar a rota inteira. Evitar HTTP não eliminava esse trabalho.
- Pages alimentam rodapé, navegação, institucional e detalhes. Hoje são três registros no corpus; não há justificativa para acrescentar uma segunda estratégia de consulta para elas nesta rodada. Taxonomias completas continuam necessárias à árvore de categorias e filtros, inclusive termos vazios.

## 3. Medição e limites da metodologia

Há três builds isolados: `main` do commit `e93edf4`, snapshot `rest` da implementação antes das correções de CPU e build final. A linha de base não é uma cópia comprovada do deploy em produção: dependências instaladas e commit publicado podem diferir do incidente.

O corpus contém respostas públicas reais: 114 produtos, 107 cidades, 23 posts, três Pages, dois trabalhos, 11 clientes, 13 marcas, 21 modelos, seis categorias de produto, uma categoria do blog, um site-config e 517 attachments utilizados. Foram feitas 19 leituras sequenciais para a captura inicial e duas leituras pontuais adicionais das quatro cidades conforme a orientação do usuário. Não houve teste de carga remoto. As repetições usam somente arquivos locais; o replay rejeita qualquer host de saída diferente do CMS e não encaminha chamadas para ele.

O Worker compilado executa no workerd local, incluindo roteamento, loaders, renderização e serialização SSR. O serviço de saída simula a REST a partir do corpus, com 5 ms por resposta; o cenário lento usa 50 ms. Filtros, paginação, slug, include/exclude, embed e projeção são reproduzidos para os cenários testados; não é uma implementação completa do WordPress nem substitui validação de plugins/cache na origem.

Foram medidos 20 caminhos/cenários com isolate frio e requisição quente, mais quatro Homes simultâneas, dez sequenciais, origem lenta e falha parcial de posts. Os resultados completos estão em [comparação do runtime](worker-runtime/comparison.md), [main](worker-runtime/main.json), [REST](worker-runtime/rest.json) e [final](worker-runtime/final.json).

### O que cada número significa

- `wallMs`: duração observada no host para resposta SSR completa. Inclui I/O simulado, IPC, instrumentação, compilação/JIT e carga do computador; não é CPU de produção. Houve variação entre amostras locais e não se deve converter suas diferenças em percentual de CPU economizada.
- `jsonBytes`: JSON descomprimido entregue ao Worker pelo replay, incluindo mídia; não é tráfego comprimido da CDN.
- `inlineScriptBytes`: aproximação do volume serializado no HTML, incluindo bootstrap e instruções de streaming. Não é somente o objeto de dados de rota.
- `restWaitSumMs`: soma dos tempos do serviço simulado. Consultas se sobrepõem; subtrair esse valor do wall-clock não calcula CPU.
- `Runtime.getHeapUsage`: memória V8 do isolate local, antes/depois de requisições. Não mede o pico da invocação nem toda a memória de produção, alocações nativas/WASM e buffers externos. Não foi usado RSS do Node como memória do Worker.
- Foram coletados perfis V8 reais pelo inspector do workerd em `artifacts/worker-audit/profiles`. Frames e `sampledNonIdleMs` são diagnósticos amostrados, sujeitos a atribuição de tempo assíncrono/nativo e overhead da ferramenta. **Não são CPU faturada por invocação.** Node, Vitest e `renderToStaticMarkup` não foram usados como substitutos dessa métrica.

Os [limites configurados no Wrangler não são impostos no desenvolvimento local](https://developers.cloudflare.com/workers/wrangler/configuration/#limits). Assim, HTTP 200 local, inclusive acima de 50 saídas na main, não aprova o Free. CPU efetiva de produção continua indisponível; precisa vir dos Workers Logs/Metrics.

Os snapshots isolados receberam apenas ajustes de ferramenta para compilar fora do checkout: dependências via junction e fonte do scanner Tailwind restrita ao próprio `src`. Não se mediu CSS nem se alterou CSS do site. A comparação verifica HTML principal e rodapé, excluindo somente os quatro links de cidades cuja ordem foi explicitamente liberada pelo usuário. Sitemap e robots são comparados integralmente.

## 4. Gargalos confirmados e correções locais

### Cidades: pedir e processar apenas os dados utilizados

A implementação REST anterior já evitava páginas seguintes de cidades fora de `/cidades/`, mas ainda recebia e normalizava 100 registros para obter quatro links. Cada registro passava por sanitização de conteúdo e extração de resumo/introdução, embora o rodapé só usasse nome, UF e URL.

Agora o rodapé consulta `cidade?per_page=4&page=1&_fields=id,slug,title,acf`. Foi verificado na REST real que essa resposta tem quatro registros e não contém HTML editorial ou imagem. A ordem é a da própria resposta, conforme autorização expressa do usuário; não se tenta conservar a antiga lista do rodapé.

`CityLink` representa apenas o dado de navegação. `/cidades/` pagina a coleção completa, mas também usa metadados leves, sem processar o corpo editorial de cada cidade. A página individual continua consultando o slug e normalizando seu conteúdo completo. O sitemap mantém todos os slugs. Isso também reduz os objetos hidratados no navegador.

### Sanitização repetida com cache quente

`normalizePost` derivava título, HTML seguro, resumo e introdução a cada chamada, mesmo reutilizando o mesmo JSON do transporte. O conteúdo também era limpo mais de uma vez para resumo e fallback de introdução.

`post-content.ts` centraliza essa derivação e reutiliza o resultado por objeto de resposta em `WeakMap`. A referência fraca não prolonga a vida do objeto cru. Uma resposta nova do transporte (após TTL ou novo endpoint) é outro objeto e é reprocessada; alterações de título/conteúdo no mesmo objeto também são detectadas. Não foi alterado TTL, criada chave por ID com validade indefinida ou removida sanitização.

### Serialização duplicada

O tipo `Post` excluía `title` e `content`, mas o spread do objeto REST ainda os carregava em runtime, junto de `_links`, `guid`, meta e outros campos não utilizados. Isso duplicava HTML bruto e sanitizado no estado SSR.

Os normalizadores de posts e termos agora retornam explicitamente os campos públicos consumidos: identificação, datas, classificações, ACF documentado, conteúdo normalizado, galeria e URLs. Os dados necessários a SEO, WhatsApp, disponibilidade e relações são mantidos. Links e metadados brutos da REST não são copiados para o estado de taxonomias. Nenhum componente consumia os campos descartados. Os testes verificam a ausência desse conteúdo duplicado.

### Sitemap

Antes, o sitemap usava taxonomias normalizadas com logos/fundos, consultava modelos e resolvia attachments que não participavam das URLs. Também recebia o corpo completo de todas as entidades.

`wordpress/sitemap.ts` consulta somente slugs/IDs e a classificação necessária à URL de produto; categorias incluem parent para manter a regra histórica e subcategorias. Não consulta mídia nem modelo. Continua paginando todas as coleções necessárias, sem limite arbitrário. A resposta XML completa é comparada com as linhas de base.

### Redirects e 404 inequivocamente inválidos

Carrinho e arquivos históricos com redirect incondicional já têm destino conhecido. Agora são resolvidos antes do contexto de conteúdo. Caminhos com mais de dois segmentos, depois de tratar esses arquivos históricos, não correspondem a nenhuma rota pública restante e retornam 404 antes de consultar esse contexto.

A configuração pública da raiz pode continuar sendo necessária ao framework. Não foi criado bloqueio por user-agent nem presumido que uma URL inválida é acesso de bot. Os demais slugs continuam consultando o CMS para decidir existência e regras de equivalência.

### O que foi mantido

Pronta entrega continua filtrando ACF estrito no servidor, com mesma contagem/paginação. Relacionados conservam o algoritmo e a consulta de genéricos; apenas itens selecionados são normalizados. Não se criou filtro PHP, índice paralelo, serviço pago ou cache externo. As consultas completas que esses algoritmos ainda precisam são um custo residual, principalmente se o catálogo crescer.

## 5. Resultados e interpretação

O comparativo anterior com a REST real continua documentado como etapa histórica em [results.md](results.md): Home 54 → 14 saídas, catálogo 70 → 12 e produto 44 → 15. O replay usa uma nova captura integral e ordenação fixa; sua listagem geral original tem outra seleção de produtos, por isso contagens frias de catálogo podem diferir daquela amostra. O benefício de rede foi preservado, mas não é uma medição de CPU.

O [comparativo workerd](worker-runtime/comparison.md) separa as três variantes, mostra JSON, scripts SSR, heap, wall-clock e concorrência. O cache quente fez zero saídas nas rotas medidas. Testes direcionados comprovam que listas de cidades não sanitizam corpo editorial, conteúdo de posts é reutilizado para a mesma resposta e o sitemap não resolve mídia.

A redução dos frames de parser/sanitizador e serializador e dos dados de rota é consistente com menos trabalho, mas não se afirma percentual de CPU em produção. O heap observado nos cenários locais diminuiu na versão final; os máximos amostrados e o início/fim da sequência estão no relatório. Coleta automática e objetos transitórios afetam esses valores. Não se provou vazamento de memória na versão original nem ausência de pressão sob qualquer concorrência.

O JS total do servidor permanece aproximadamente 1,46 MB sem compressão e cerca de 0,34 MB somando gzip dos módulos. Não foi identificado crescimento de bundle como causa demonstrada do incidente. Esses números não são tamanho oficial de upload nem `startup_time_ms`; não houve upload para medi-los. React SSR, serialização e sanitização continuam no servidor.

## 6. Observabilidade sincronizada

O único acréscimo ao `wrangler.jsonc` é:

```json
"observability": {
  "logs": {
    "enabled": true,
    "head_sampling_rate": 1,
    "invocation_logs": true,
    "persist": true
  },
  "traces": {
    "enabled": false
  }
}
```

O schema instalado aceita essas opções, e o build gerou o mesmo bloco em `dist/server/wrangler.json`. Foi comparada a configuração anterior após retirar `observability`: todos os demais campos coincidiram. Não foram acrescentados `limits`, configuração de plano, destinos de exportação ou outras opções do painel. Traces continuam desativados. Ver [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/) e [exportação/persistência](https://developers.cloudflare.com/workers/observability/opentelemetry-export/).

## 7. Riscos e hipóteses ainda abertas

- CPU acima do orçamento é a hipótese principal pelo dado de 19 ms, mas falta o outcome do Ray ID. Memória e outras classes de erro não podem ser descartadas com a taxa agregada.
- Cache de assets não equivale a cache do SSR, do WordPress ou do TanStack. Isolates novos e expiração continuam produzindo trabalho frio.
- O cache REST limita entradas, não bytes. Entradas expiradas podem permanecer na memória até serem substituídas ou o Map ser limpo por tamanho. Isso é um risco de retenção sob muitas consultas distintas, não um vazamento confirmado. Não se alterou sua política por hipótese.
- A amostra de dez acessos quentes e quatro concorrentes não cobre toda a distribuição de tráfego, filtros, conteúdo muito maior, edição no CMS ou todos os isolates/POPs.
- Não há evidência para atribuir os erros a bots. São necessários paths, user-agent, status, versão e distribuição temporal. Não foram criadas regras de WAF/cache/bot management.
- Falha parcial de posts e atraso de origem foram testados offline. Não se provocou indisponibilidade real do WordPress. A invalidação do WP REST Cache após edição continua fora do que foi comprovado.

## 8. Como verificar os Workers Logs

No Worker correto, abrir Observability e uma janela que contenha erros novos, ou Metrics → Errors → Invocation Statuses. Localizar o horário de Brasília/UTC e, quando disponível, Ray/request ID e URL. Separar `Exceeded CPU Time Limits`, `Exceeded Memory`, exceções e excesso de subsolicitações; não agrupar tudo como 1102.

No Query Builder, verificar os campos efetivamente presentes. A [documentação oficial](https://developers.cloudflare.com/workers/observability/query-builder/) usa `$workers.cpuTimeMs`; comparar por rota e versão, incluindo percentis e máximo. Observar também wall time, outcome e status. Para exports/Analytics/Logpush, procurar os outcomes documentados `exceededCpu` e `exceededMemory`; não presumir que todos os painéis apresentam os nomes da mesma maneira.

Se ocorrer novamente, fornecer o JSON da invocação com: timestamp e fuso, URL/método, Ray/request ID, outcome, CPU time, wall time, status, exceptions/stack e version ID do Worker. Enviar também a distribuição de erros por invocation status e p50/p95/p99/máximo de CPU por rota/versão. Memória não deve ser inventada se o evento não a trouxer; o outcome de memória e as exceções são o primeiro discriminante. Cookies, tokens e IPs podem ser omitidos.

Logs recém-habilitados não garantem um registro recuperável do incidente anterior. A ausência de novo erro durante a auditoria não é evidência de correção, pois nada foi publicado.

## 9. Validação e reprodução

Os scripts `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` e `pnpm test:ssr` são executados para o estado final. Os testes SSR desta auditoria usam `serve-worker-audit.mjs`: HTTP local, SSR no workerd e corpus público real capturado, com saída externa bloqueada. Os assets vêm dos arquivos do build. Não se repete a suíte contra a origem em cada rodada.

| Verificação final | Resultado |
| --- | --- |
| Typecheck / lint | Passaram |
| Testes automatizados | 129 passaram; uma medição opt-in ignorada na suíte normal |
| Build | Cliente e Worker SSR gerados com sucesso |
| `test:ssr` | Passou no workerd offline: conteúdo, filtros, paginação, metadados, canonical, OG/Twitter, 404, redirects, sitemap, robots e assets |
| Preservação | 20 hashes de conteúdo principal e rodapé (exceto cidades autorizadas); sitemap/robots integrais; 19 snapshots estáticos aprovados intactos |
| Wrangler | Apenas `observability` acrescentado; mesmos valores na configuração gerada |

Alterações desta rodada: `wordpress/cities.ts` e tipos de `SiteData`/Footer para links leves; `post-content.ts` e `normalize.ts` para sanitização reutilizada e DTO explícito; `taxonomies.ts` para DTO explícito; `wordpress/sitemap.ts` e rota XML para projeção; `product-urls.ts` apenas com tipos de classificação mínimos; `legacy-redirects.ts`/`resolve-route.ts` para dispensar contexto em destinos incondicionais e caminhos impossíveis; `wrangler.jsonc` para logs. O Footer teve somente alteração de tipo, sem markup. O ESLint ignora os snapshots gerados em `artifacts`. Os scripts de captura/replay/perfil/relatório e `worker-efficiency.test.ts` permitem revisar e repetir a validação. Não houve mudança de dependências, CSS, WhatsApp, motion, campos ACF ou galerias.

Reprodução local (as capturas exigem rede; os demais passos são offline):

```powershell
node scripts/capture-worker-audit.mjs
# Executar prepare-worker-audit main/rest apenas para novos snapshots;
# rest deve ser preservado antes das correções de CPU, não sobrescrito depois.
node scripts/audit-worker-runtime.mjs main
node scripts/audit-worker-runtime.mjs rest
node scripts/audit-worker-runtime.mjs final
node scripts/report-worker-audit.mjs
node scripts/serve-worker-audit.mjs
# Em outro terminal:
$env:TEST_BASE_URL='http://127.0.0.1:3100'
pnpm test:ssr
```

Snapshots, corpus e perfis ficam em `artifacts/worker-audit` (ignorado pelo Git). O ESLint também ignora esses artefatos gerados; fontes e testes normais continuam cobertos. Os JSONs e tabelas de resultados ficam em `docs/performance/worker-runtime`. A validação de hashes não aceita mudança de conteúdo principal ou sitemap; exclui apenas os links de cidades expressamente autorizados. Snapshots visuais aprovados não são atualizados.

## 10. Recomendação e publicação

Não aprovar estabilidade no Free somente com esses testes locais. As correções reduzem trabalho comprovadamente desnecessário, mas o código continua realizando SSR e sanitização em um orçamento apertado. É preciso correlacionar o próximo erro com CPU/memória na versão realmente publicada e medir a distribuição de CPU da versão nova em ambiente remoto autorizado, inclusive acessos frios e filtros.

Se a CPU efetiva permanecer próxima/acima de 10 ms ou houver `exceededCpu`, a proposta objetiva é avaliar Workers Paid antes de prometer disponibilidade. Uma eventual alternativa de cache de HTML/pré-renderização exigiria desenho de invalidação e aprovação arquitetural. Nenhuma dessas mudanças de infraestrutura foi implementada. O plano pago também não elimina o limite de memória nem substitui a análise das exceções.

As mudanças continuam locais para revisão. Para rollback, preservar o diff e reverter somente esta rodada após validação do responsável; a otimização REST não deve ser descartada. O WordPress e a configuração remota permaneceram inalterados.

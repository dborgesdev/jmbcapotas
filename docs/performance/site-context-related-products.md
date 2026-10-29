# siteContext e produtos relacionados — validação local

## Base e diagnóstico

Branch `codex/jmb-context-related-performance`, a partir de `98fa1c69cae7ce59fa027e57739b1cfe02580d3e` (PR #4). A main remota foi conferida, assim como a versão publicada `b0dd5eca-0855-4835-86c5-b87019b03a7e`, deployment `f23bc932-f3b8-47c4-aa97-319cdfe113f7`. Nenhum commit, push, PR, merge, deploy ou alteração no WordPress/Cloudflare nesta etapa.

Antes, `relatedProducts` consultava o par marca/modelo e completava a seleção por uma varredura paginada de genéricos (`all<RawPost>("produto", ...)`). `siteContext` reconstruía taxonomias e Pages normalizadas a cada acesso, embora as respostas REST brutas já tivessem cache de 60 segundos e o conteúdo editorial sanitizado fosse memoizado por referência.

## Relacionados

Uma única consulta paginada, com `marca`, `modelo`, `tax_relation=AND`, `exclude` e `per_page=4`. Sem marca ou sem modelo: nenhuma consulta de relacionados. Sem resultados: seção omitida. Um ou dois resultados permanecem um ou dois; não há complemento por categoria, genéricos ou outro veículo. IDs duplicados e o produto atual são descartados, com verificação defensiva das duas interseções. Normalização, embed, lotes de mídia e fallback permanecem.

Três GETs limitados ao WordPress real verificaram a semântica: `marca=10,15&modelo=25,32&tax_relation=AND` retornou resultados em que há interseção nas duas taxonomias; `marca=10&modelo=25` retornou zero; `marca=15&modelo=25` retornou seis no total, com quatro na página. Portanto, listas significam OR dentro da taxonomia e AND entre taxonomias. Não se exige que todos os termos sejam iguais, nem se deduz compatibilidade de apenas uma taxonomia. O corpus atual não contém produtos com múltiplos termos; esse caso também é coberto por testes sintéticos. Não se inferem pares marca/modelo ausentes do cadastro.

Cards e grade existentes preservados: renderizam somente os resultados presentes, sem placeholders. Nenhum snapshot visual foi atualizado; os 19 cenários existentes continuam aprovados.

## Contexto global e memória

`site/global-context.ts` mantém somente um snapshot público normalizado por isolate e uma Promise em andamento. TTL de **60 segundos**, contado ao concluir o carregamento; contexto degradado ou configuração indisponível: **10 segundos**. A próxima chamada após expiração aguarda a renovação; requisições concorrentes compartilham a mesma Promise. O snapshot expirado é solto durante a renovação. Não há cache de SiteData por URL, Map de visitantes, cópias profundas, JSON roundtrip, KV ou dependência nova.

O TTL conservador mantém a frequência atual de atualização dos dados globais, sem adotar cinco minutos antes de validar o efeito em produção. Reaproveitar a normalização já elimina trabalho no intervalo de 60 segundos. Os caches REST e site-config existentes continuam independentes: uma resposta bruta ainda válida no instante da renovação pode prolongar a defasagem observável em até aproximadamente mais 60 segundos; mídia também depende do seu cache REST. WP REST Cache não invalida estes caches. Isolates podem desaparecer a qualquer momento: o cache é uma otimização, nunca um requisito de funcionamento. O número de entradas é fixo; o tamanho do snapshot depende do conteúdo publicado e não é um limite rígido em bytes.

A configuração global mantém seu cache já existente, sem cópia do objeto. A rota raiz usa `staleTime: 60_000` para reutilizar o loader público durante navegações do Router. Não alteramos o staleTime das rotas de conteúdo nem seus loaderDeps: filtros, busca, paginação e SEO continuam carregando conforme a rota. `router.invalidate()` conserva a invalidação nativa; não invalida magicamente o cache do Worker. Navegações com links HTML normais continuam sendo acessos SSR e também aproveitam o cache do servidor. Não há localStorage/sessionStorage.

`siteContext` cria somente o envelope de rota e uma cópia rasa de Search; não coloca caminho, busca, filtros, produto ou visitante no snapshot global. Objetos globais são compartilhados para leitura, sem mutação nos consumidores existentes. As quatro cidades do rodapé permanecem limitadas na origem. Somente `/cidades/` carrega o índice completo de metadados, fora do snapshot global. Modelos são necessários aos nomes de veículo/filtros, categorias aos menus/URLs e Pages ao menu institucional, rodapé e resolução editorial; mantê-los no snapshot pequeno evita novas consultas e não altera esses contratos. O conteúdo editorial das Pages e a serialização dos globais no payload de cada rota ainda existem; esta alteração reduz sua reconstrução, sem prometer eliminar todo custo de serialização do SSR.

## Antes/depois

Workerd/Miniflare local, mesmos oito caminhos e mesmo corpus público real capturado anteriormente, replay externo bloqueado, atraso REST simulado de 5 ms. Baseline congelado da main aprovada; não é comparação com a versão anterior ao PR #4. Uma amostra fria e uma quente por caminho; sequência de seis produtos duas vezes e quatro Home concorrentes. Dados: `worker-runtime/context-before.json` e `context-after.json`. Reprodução: preparar/buildar o snapshot com `prepare-worker-audit.mjs context-before`, buildar a branch, executar `audit-worker-runtime.mjs context-before`, `audit-worker-runtime.mjs context-after`, `report-context-related.mjs`.

Os tempos abaixo são **wall-clock do SSR completo**, com profiler ligado, incluindo serialização/renderização e replay; não são CPU faturada, nem benchmark estatístico. A variabilidade de JIT, GC e máquina impede atribuir todo ganho frio ao cache. O catálogo quente e Saveiro quente ficaram ligeiramente mais lentos nesta amostra; não omitimos esses resultados.

| Cenário | HTTP frio antes → depois | JSON REST bytes | SSR frio ms | SSR quente ms |
|---|---:|---:|---:|---:|
| Home | 14 → 14 | 156367 → 156367 | 275.04 → 182.61 | 58.44 → 32.78 |
| Catálogo | 12 → 12 | 195848 → 195848 | 242.44 → 175.44 | 39.86 → 46.78 |
| Saveiro | 14 → 14 | 141116 → 141116 | 210.12 → 199.56 | 31.18 → 33.55 |
| Defender (zero) | 15 → 13 | 92626 → 84366 | 261.61 → 212.96 | 37.5 → 31.33 |
| Strada | 15 → 13 | 94047 → 85787 | 260.72 → 177.08 | 30.52 → 19.64 |
| Hilux (cinco → quatro) | 14 → 14 | 110678 → 110678 | 244.67 → 194.92 | 47.95 → 25.26 |
| Dakota (dois) | 14 → 12 | 100171 → 91911 | 212.68 → 155.79 | 26.21 → 22.7 |
| Sem marca/modelo | 13 → 12 | 86387 → 86385 | 173.92 → 173.06 | 29.73 → 20.68 |

- Navegação sequencial pelos seis produtos, duas passagens: **33 → 28** chamadas REST. A segunda passagem fez zero HTTP em ambos os casos (HIT do transporte existente). O contexto normalizado acrescenta um HIT acima do transporte: não chama novamente taxonomias, Pages e cidades enquanto válido; testes com spies verificam uma construção para chamadas concorrentes e rotas distintas, e nova construção após expiração. Não adicionamos telemetria global de produção apenas para contar HITs.
- Nenhuma consulta `produto?per_page=100` nos oito cenários novos; a varredura de genéricos foi removida do código. A varredura de pronta entrega, fora deste escopo, permanece.
- Home, catálogo, Saveiro, Hilux e produto sem veículo preservaram o hash do HTML principal; mudanças em Defender, Strada e Dakota correspondem à remoção dos genéricos. Footer e status preservados em todos os cenários. O relatório automatizado verifica essas invariantes.
- Maior heap V8 observado no conjunto: **12,13 → 11,24 MiB**. Após SSR frio da Home: **8,46 → 8,05 MiB**; Defender: **7,19 → 6,75 MiB**. São amostras sem GC forçado, não RSS total, nem memória/limite real do Worker em produção. Retenção adicional do cache é um snapshot pequeno, limitado em quantidade e substituído, não um conjunto crescente por URL.
- Tempo isolado de normalização/loaders não foi instrumentado no Worker; usamos contagem das fontes de normalização nos testes e duração do SSR completo. Profiles locais ficam em artifacts, ignorados pelo Git. `sampledNonIdleMs` é amostragem do profiler local, não CPU de produção.
- Expiração, renovação, falhas de taxonomias/Pages, deduplicação concorrente, manutenção das quatro cidades e isolamento de Search são validados com relógio controlado, sem esperar um minuto real ou fazer carga na produção.

## Validação e publicação

`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` e `pnpm test:ssr` executados localmente. Suite: 139 testes aprovados, um teste de medição opt-in ignorado. SSR: Home, catálogo, Saveiro, Defender, produtos/categorias/marcas, editorial, cidades, filtros, paginação, 301/404, sitemap, robots, favicon e OG-image. O navegador local confirmou Defender sem seção de relacionados; CTAs/galeria e rodapé continuam presentes.

Impacto esperado: menos chamadas e processamento nas páginas com poucos/nenhum relacionado; reutilização da normalização dos dados globais em acessos SSR e chamadas do Router dentro do TTL. Não há medição de CPU real desta branch porque **não houve deploy**. As amostras da versão publicada anterior (25 ms Saveiro, 38–65 ms Defender) continuam sendo daquela versão e não comprovam resultado destas mudanças.

Recomendação: publicar após aprovação, com o mesmo procedimento de CI, rollback e comparação de logs por rota/versão utilizado no PR #4. Não afirmar resolução do limite de 10 ms com testes locais; mesmo com esta otimização, renderização React e serialização permanecem e precisam de validação real. Nenhuma nova mudança arquitetural ou de plano foi implementada.

Na primeira entrada fria em `/cidades/`, o snapshot global também solicita os quatro links do rodapé antes da listagem completa de metadados: pode haver uma consulta pequena adicional nessa rota em troca de manter o snapshot independente da rota e reutilizável nos acessos seguintes. Não há consulta editorial completa de cidades para o rodapé. A navegação local produto → marca → filtro de modelo foi exercitada e preservou o produto e o filtro selecionado.

## Finalização autorizada em 29/10/2026

O usuário autorizou posteriormente commit, push, PR, merge e deploy desta implementação. A seção anterior registra a validação local anterior à autorização. A versão ativa antes desta publicação foi registrada em snapshot privado ignorado no Git; rollback preparado para `b0dd5eca-0855-4835-86c5-b87019b03a7e`. Publicação condicionada ao CI aprovado e verificação de regressões nas rotas reais, com comparação de CPU por versão. Nenhuma mudança de plano, WordPress ou configuração de Cloudflare faz parte desta finalização.

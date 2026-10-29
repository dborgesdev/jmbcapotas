# Medições REST e SSR dos componentes

Amostra local final sequencial em 29/10/2026. A → D = antes → depois. Frio/quente referem-se à memória do frontend. Métodos, limites e comandos em [relatório técnico](../rest-performance.md). Bytes são JSON descomprimido, incluindo attachments; tempos não são médias estatísticas nem TTFB de produção.

## Cache frio por página

| Página | HTTP A → D | media/{id} A → D | Dados ms A → D | JSON KiB A → D | SSR componentes ms A → D |
| --- | --- | --- | --- | --- | --- |
| Home | 54 → 14 | 43 → 1 | 946 → 558 | 444.7 → 369.9 | 43.23 → 39.72 |
| Catálogo | 70 → 12 | 62 → 1 | 881 → 347 | 531.0 → 397.2 | 10.74 → 12.62 |
| Categoria fibra | 76 → 12 | 68 → 1 | 1540 → 369 | 562.1 → 410.9 | 9.69 → 9.6 |
| Marca Fiat | 83 → 12 | 75 → 1 | 964 → 303 | 575.0 → 413.0 | 11.89 → 9.71 |
| Produto CFF-01 | 44 → 15 | 34 → 1 | 1188 → 615 | 396.4 → 319.4 | 7.73 → 6.96 |
| Pronta entrega | 44 → 13 | 35 → 1 | 570 → 465 | 673.8 → 594.0 | 8.35 → 7.12 |
| Trabalhos | 36 → 11 | 28 → 1 | 423 → 261 | 372.8 → 310.7 | 5.68 → 5.05 |
| Trabalho individual | 40 → 13 | 31 → 1 | 580 → 494 | 384.4 → 315.2 | 5.96 → 6.78 |
| Blog | 45 → 12 | 36 → 1 | 677 → 307 | 469.4 → 398.2 | 9.62 → 9.44 |
| Artigo Ram 2500 | 35 → 11 | 27 → 1 | 451 → 353 | 371.7 → 310.8 | 13.14 → 11.53 |
| Quem somos | 33 → 10 | 26 → 1 | 318 → 169 | 362.4 → 302.5 | 5.5 → 5.23 |
| Conserto | 36 → 11 | 28 → 1 | 835 → 213 | 372.8 → 310.7 | 4.74 → 6.06 |
| Cidades (lista completa) | 33 → 11 | 26 → 1 | 304 → 273 | 362.4 → 321.4 | 11.97 → 10.3 |

A renderização acima é somente `renderToStaticMarkup(SiteView)` após carregar dados reais, com aquecimento inicial de React/JIT incluído. A verificação de HTML/status/metadados do Worker local é feita separadamente por `pnpm test:ssr`. Não medimos TTFB antes/depois em Workers de produção.

## Cache e deduplicação por página

| Página | HIT frio A → D | Pending frio A → D | HTTP quente A → D | HIT quente A → D | Dados quentes ms A → D |
| --- | --- | --- | --- | --- | --- |
| Home | 5 → 0 | 2 → 0 | 0 → 0 | 59 → 12 | 63 → 55 |
| Catálogo | 5 → 0 | 2 → 0 | 0 → 0 | 75 → 10 | 50 → 42 |
| Categoria fibra | 5 → 0 | 2 → 0 | 0 → 0 | 81 → 10 | 47 → 41 |
| Marca Fiat | 5 → 0 | 2 → 0 | 0 → 0 | 88 → 10 | 53 → 41 |
| Produto CFF-01 | 5 → 0 | 2 → 0 | 0 → 0 | 49 → 13 | 41 → 34 |
| Pronta entrega | 5 → 0 | 2 → 0 | 0 → 0 | 49 → 11 | 50 → 38 |
| Trabalhos | 5 → 0 | 2 → 0 | 0 → 0 | 41 → 9 | 40 → 40 |
| Trabalho individual | 5 → 0 | 2 → 0 | 0 → 0 | 45 → 11 | 39 → 36 |
| Blog | 5 → 0 | 2 → 0 | 0 → 0 | 50 → 10 | 50 → 48 |
| Artigo Ram 2500 | 5 → 0 | 2 → 0 | 0 → 0 | 40 → 9 | 43 → 38 |
| Quem somos | 5 → 0 | 2 → 0 | 0 → 0 | 38 → 8 | 41 → 39 |
| Conserto | 5 → 0 | 2 → 0 | 0 → 0 | 41 → 9 | 52 → 34 |
| Cidades (lista completa) | 5 → 0 | 2 → 0 | 0 → 0 | 38 → 9 | 51 → 41 |

MISS equivale às chamadas HTTP na tabela anterior. A redução de HIT/pending em algumas páginas decorre da eliminação das chamadas individuais redundantes; não significa pior cache. Site-config possui cache próprio e pode evitar a entrada no transporte.

## Endpoints: soma dos 13 carregamentos frios isolados

| Endpoint | Antes | Depois | Eliminadas (negativo = adicionadas) |
| --- | --- | --- | --- |
| categoria_produto | 13 | 13 | 0 |
| categories | 1 | 1 | 0 |
| cidade | 26 | 14 | 12 |
| cliente | 1 | 1 | 0 |
| marca | 13 | 13 | 0 |
| media | 0 | 46 | -46 |
| media/{id} | 519 | 13 | 506 |
| modelo | 13 | 13 | 0 |
| pages | 13 | 13 | 0 |
| posts | 3 | 3 | 0 |
| produto | 10 | 10 | 0 |
| site-config | 13 | 13 | 0 |
| trabalho | 4 | 4 | 0 |

As consultas de conteúdo renderizado usam embed restrito; `/media` são coleções por include com projeção `_fields`. A única consulta individual recorrente é o attachment compartilhado do Hero/CTA, cujo ACF continua retornando ID.

## Payload por resposta: teste de recursos nativos

| Endpoint (1 item) | Normal bytes | Standard bytes | Embed destacado bytes | Standard + embed bytes |
| --- | --- | --- | --- | --- |
| produto | 2544 | 2571 | 4921 | 4948 |
| trabalho | 1786 | 2945 | 4128 | 5287 |
| cliente | 1099 | 1099 | 2924 | 2924 |
| marca | 1131 | 1210 | 1131 | 1210 |
| modelo | 883 | 1045 | 883 | 1045 |
| categoria_produto | 776 | 976 | 776 | 976 |
| site-config | 1396 | 1608 | 1396 | 1608 |
| pages | 3902 | 3902 | 6875 | 6875 |
| posts | 5563 | 5563 | 7802 | 7802 |
| cidade | 2349 | 2349 | 2349 | 2349 |

O aumento por resposta de conteúdo foi compensado pela eliminação das respostas individuais e pela projeção dos lotes: o JSON total diminuiu nas 13 páginas medidas. No formato standard observado, imagens ACF preenchidas são URLs sem metadados; não ativamos esse formato. O teste adicional com embed completo está em `native-acf-detail.json`.

## Conservação dos dados

Os 13 hashes SHA-256 de conteúdo público normalizado e os 13 hashes do HTML renderizado coincidem antes/depois. Cidades são comparadas integralmente na rota de cidades e pelos quatro links usados nas demais rotas. Incluem galerias em ordem, URLs, alt, dimensões, srcSet, configuração, taxonomias, paginação, relacionados e clientes. Todos os endpoints medidos retornaram 200; nenhuma redução dependeu de esconder uma falha. Os logs JSON registram o path completo de cada cenário e duração/bytes por endpoint.

# Comparação offline no workerd

M / R / F = main e93edf4 / otimização REST preservada / versão final da auditoria. Mesma cópia real do CMS, serviço REST reproduzido localmente com 5 ms de espera artificial por consulta. Não são medições da rede de produção. Amostras de wall-clock incluem IPC, instrumentação, JIT e carga do computador; não são CPU faturada nem garantia de latência.

## Rotas, wall-clock e subsolicitações

| Rota | HTTP | Subsolicitações frias M/R/F | Wall frio ms M/R/F | Wall quente ms M/R/F |
| --- | --- | --- | --- | --- |
| / | 200 | 54 / 14 / 14 | 500.29 / 257.68 / 167.91 | 147.3 / 138.63 / 28.28 |
| /produtos/ | 200 | 80 / 12 / 12 | 424.34 / 305.05 / 170.87 | 122.35 / 96.15 / 44.45 |
| /produtos/capota-de-fibra/ | 200 | 76 / 12 / 12 | 309.25 / 272.13 / 191.79 | 91.87 / 97.96 / 41.69 |
| /marcas/capota-de-fibra-para-fiat/ | 200 | 84 / 12 / 12 | 294.79 / 217.64 / 172.86 | 93.62 / 78.66 / 42.32 |
| /capota-para-picape/capota-de-fibra-com-portas-laterais-para-fiat-strada/ | 200 | 44 / 15 / 15 | 362.98 / 315.36 / 216.66 | 83.98 / 111.33 / 25.89 |
| /capota-para-picape/capota-furgao-com-porta-traseira-horizontal-vw-saveiro/ | 200 | 59 / 14 / 14 | 285.37 / 316.87 / 233.05 | 81.83 / 117.47 / 28.15 |
| /capota-para-picape/capota-de-fibra-basica-para-land-rover-defender/ | 200 | 44 / 15 / 15 | 376.03 / 299.36 / 225.26 | 78.86 / 82.49 / 28.55 |
| /pronta-entrega/ | 200 | 44 / 13 / 13 | 272.21 / 254.61 / 181.15 | 84.33 / 79.15 / 25.84 |
| /trabalhos/ | 200 | 36 / 11 / 11 | 259.9 / 203.92 / 150.92 | 95.57 / 80.46 / 26.65 |
| /trabalhos/instalacao-capota-de-fibra-empresa-xyz/ | 200 | 40 / 13 / 13 | 397.27 / 258.7 / 241.09 | 110.91 / 93.33 / 28.63 |
| /blog/ | 200 | 45 / 12 / 12 | 358.61 / 285.34 / 220.17 | 83.92 / 96 / 37.43 |
| /blog/jmb-capotas-apresenta-nova-ram-2500-rodeo-edition/ | 200 | 35 / 11 / 11 | 675.94 / 292.19 / 208.53 | 83.43 / 99.46 / 21.61 |
| /quem-somos/ | 200 | 33 / 10 / 10 | 284.4 / 229.38 / 195.78 | 71.52 / 85.43 / 28.12 |
| /conserto-de-capotas-de-fibra/ | 200 | 36 / 11 / 11 | 267.64 / 233.93 / 181.26 | 97.45 / 87.79 / 28.53 |
| /cidades/ | 200 | 33 / 11 / 11 | 304.01 / 365.61 / 139.55 | 100.04 / 127.3 / 29.07 |
| /venda-de-capota-para-picape-em-curitiba/ | 200 | 34 / 11 / 11 | 324.56 / 333.1 / 149.65 | 99.22 / 118.82 / 21.3 |
| /produtos/?marca=4&modelo=5&q=Strada | 200 | 38 / 12 / 12 | 404.39 / 336.57 / 276.66 | 130.73 / 106.09 / 65.34 |
| /caminho-inexistente/ | 404 | 34 / 11 / 11 | 307.18 / 193.74 / 117.48 | 105.31 / 71.35 / 14.28 |
| /nao/existe/aqui/ | 404 | 33 / 10 / 2 | 219.41 / 188.02 / 85.69 | 69.98 / 66.74 / 11.67 |
| /carrinho/ | 301 | 33 / 10 / 0 | 195.16 / 161.07 / 77.62 | 62.45 / 55.59 / 6.12 |
| /sitemap.xml | 200 | 32 / 13 / 9 | 119.05 / 108.51 / 58.48 | 12.54 / 11.88 / 7.68 |
| /robots.txt | 200 | 0 / 0 / 0 | 23.74 / 39.27 / 10.99 | 4.3 / 6.34 / 4.97 |

Todas as rotas quentes fizeram zero subsolicitações. Redirecionamentos 307/308 de normalização são seguidos localmente até o conteúdo; 301 de migração permanece visível. O runtime local não valida aprovação dos limites do plano Free.

## JSON, serialização e heap V8

| Rota | JSON frio KiB M/R/F | Scripts inline KiB M/R/F | HTML resposta KiB M/R/F | Heap após frio MiB M/R/F |
| --- | --- | --- | --- | --- |
| / | 418.9 / 366.0 / 152.7 | 503.0 / 112.8 / 40.9 | 541.3 / 151.0 / 79.2 | 12.75 / 14.66 / 8.06 |
| /produtos/ | 534.8 / 404.5 / 191.3 | 528.0 / 137.8 / 61.1 | 560.5 / 170.5 / 93.8 | 14.13 / 14.95 / 8.68 |
| /produtos/capota-de-fibra/ | 522.2 / 400.2 / 186.9 | 526.7 / 136.5 / 59.8 | 554.9 / 164.9 / 88.2 | 14.00 / 14.98 / 8.45 |
| /marcas/capota-de-fibra-para-fiat/ | 549.0 / 407.7 / 194.5 | 530.7 / 140.5 / 63.6 | 559.5 / 169.4 / 92.5 | 14.12 / 14.98 / 8.55 |
| /capota-para-picape/capota-de-fibra-com-portas-laterais-para-fiat-strada/ | 373.8 / 305.1 / 91.8 | 477.3 / 87.1 / 31.4 | 494.3 / 104.1 / 48.4 | 12.17 / 13.37 / 7.12 |
| /capota-para-picape/capota-furgao-com-porta-traseira-horizontal-vw-saveiro/ | 450.4 / 351.1 / 137.8 | 498.6 / 108.5 / 46.2 | 522.6 / 132.4 / 70.1 | 12.41 / 13.99 / 7.74 |
| /capota-para-picape/capota-de-fibra-basica-para-land-rover-defender/ | 371.8 / 303.7 / 90.5 | 476.9 / 86.7 / 30.9 | 492.5 / 102.3 / 46.5 | 12.18 / 13.59 / 7.12 |
| /pronta-entrega/ | 639.0 / 566.3 / 353.0 | 476.3 / 86.1 / 30.3 | 490.7 / 100.6 / 44.8 | 12.45 / 14.15 / 7.63 |
| /trabalhos/ | 351.1 / 297.6 / 84.3 | 471.3 / 81.1 / 26.3 | 481.5 / 91.4 / 36.6 | 12.13 / 13.11 / 7.04 |
| /trabalhos/instalacao-capota-de-fibra-empresa-xyz/ | 362.3 / 302.1 / 88.9 | 473.8 / 83.6 / 28.3 | 485.0 / 94.8 / 39.5 | 12.16 / 13.21 / 6.77 |
| /blog/ | 439.0 / 385.8 / 172.6 | 582.5 / 192.3 / 73.4 | 605.0 / 214.9 / 96.1 | 17.35 / 12.17 / 9.49 |
| /blog/jmb-capotas-apresenta-nova-ram-2500-rodeo-edition/ | 349.9 / 296.4 / 83.1 | 475.7 / 85.6 / 28.1 | 487.6 / 97.4 / 39.9 | 12.20 / 13.21 / 7.06 |
| /quem-somos/ | 341.1 / 287.5 / 74.3 | 466.2 / 76.0 / 24.2 | 476.2 / 86.0 / 34.2 | 17.11 / 12.91 / 6.59 |
| /conserto-de-capotas-de-fibra/ | 351.1 / 297.6 / 84.3 | 471.3 / 81.1 / 26.3 | 484.2 / 94.0 / 39.1 | 12.16 / 13.09 / 6.75 |
| /cidades/ | 341.1 / 306.6 / 83.5 | 466.2 / 466.2 / 37.9 | 492.8 / 493.0 / 64.7 | 12.12 / 12.05 / 7.71 |
| /venda-de-capota-para-picape-em-curitiba/ | 343.3 / 293.6 / 80.4 | 470.7 / 80.5 / 26.6 | 481.3 / 91.2 / 37.3 | 12.12 / 13.02 / 6.73 |
| /produtos/?marca=4&modelo=5&q=Strada | 357.3 / 297.0 / 83.8 | 471.2 / 81.0 / 27.3 | 489.9 / 99.9 / 46.2 | 12.15 / 13.16 / 6.86 |
| /caminho-inexistente/ | 341.1 / 287.5 / 74.3 | 1.8 / 1.8 / 1.8 | 8.1 / 9.3 / 9.3 | 12.45 / 11.66 / 6.26 |
| /nao/existe/aqui/ | 341.1 / 287.5 / 5.4 | 1.8 / 1.8 / 1.8 | 8.1 / 9.2 / 9.2 | 12.16 / 11.62 / 6.23 |
| /carrinho/ | 341.1 / 287.5 / 0.0 | 0.0 / 0.0 / 0.0 | 0.0 / 0.0 / 0.0 | 11.69 / 10.88 / 5.27 |
| /sitemap.xml | 716.2 / 678.0 / 18.1 | 0.0 / 0.0 / 0.0 | 27.3 / 27.3 / 27.3 | 7.76 / 7.25 / 4.97 |
| /robots.txt | 0.0 / 0.0 / 0.0 | 0.0 / 0.0 / 0.0 | 0.1 / 0.1 / 0.1 | 5.72 / 5.73 / 5.36 |

Scripts inline são uma aproximação do volume serializado: incluem também bootstrap e instruções de streaming, não somente os dados de rota. Heap é `Runtime.getHeapUsage.usedSize` no isolate do Worker local; snapshots após requisições não representam pico nem memória total de produção (WASM/allocações externas incluídas no limite de 128 MB).

## Sequência, concorrência e falhas

| Cenário Home | M wall ms / chamadas | R wall ms / chamadas | F wall ms / chamadas |
| --- | --- | --- | --- |
| concurrent-cold | 1880.12 / 54 | 713.49 / 14 | 341.77 / 14 |
| concurrent-warm | 709.77 / 0 | 352.23 / 0 | 117.55 / 0 |
| slow-rest | 1037.41 / 54 | 388.91 / 14 | 328.26 / 14 |
| partial-failure | 561.12 / 51 | 216.07 / 14 | 176.89 / 14 |

Concurrent = quatro respostas simultâneas; wall, subsolicitações e perfis representam o lote inteiro, não cada requisição. Há deduplicação entre invocações do mesmo isolate. Slow-rest usa 50 ms por resposta local; partial-failure simula HTTP 503 apenas em posts, preservando Home 200. A soma de `restWaitSumMs` nos JSONs se sobrepõe entre consultas; não pode ser subtraída do wall para calcular CPU.

| Variante | Mediana wall de 10 Homes quentes ms | Maior heap observado MiB | Heap início/fim da sequência MiB | JS servidor raw / soma gzip KiB |
| --- | --- | --- | --- | --- |
| main | 118.61 | 64.70 | 59.07 / 64.70 | 1425.9 / 329.3 |
| rest | 83.47 | 69.03 | 38.61 / 30.98 | 1430.2 / 330.7 |
| final | 28.29 | 12.41 | 11.50 / 12.41 | 1429.1 / 330.3 |

Sem GC forçado. Variação do heap inclui objetos transitórios, aquecimento e coleta automática; dez acessos à mesma rota não provam ausência de crescimento sob todos os filtros/conteúdos. Os bytes gzip acima somam arquivos comprimidos individualmente e não representam o tamanho oficial do upload nem startup_time_ms.

## CPU e preservação

CPU faturada de produção: **não disponível**. Foram obtidos perfis V8 do workerd real local, armazenados em `artifacts/worker-audit/profiles`. `sampledNonIdleMs` e frames são diagnósticos amostrados: podem incluir atribuição de tempo assíncrono/nativo e overhead do inspector. Não usamos esses números como CPU por invocação nem para declarar atendimento a 10 ms. Não se usa Node/Vitest/renderToStaticMarkup como CPU do Worker.

As 22 rotas preservaram status e o hash do conteúdo de main. O rodapé preservou hash após excluir exclusivamente os quatro links de cidades cuja mudança foi autorizada pelo usuário. Sitemap e robots preservaram também o hash da resposta completa. O arquivo Wrangler preservou todos os campos anteriores; apenas observability foi acrescentado e os mesmos valores chegaram à configuração do build.

Logs completos: [main](main.json), [REST](rest.json), [final](final.json). Diagnóstico e restrições: [auditoria](../cloudflare-worker-audit.md).

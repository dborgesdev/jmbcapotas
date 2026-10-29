# Validação local — 29/10/2026

> Registro da etapa REST anterior à auditoria de CPU. Para o estado final, inclusive quatro cidades consultadas na origem e testes adicionais, consultar a [auditoria do Worker](cloudflare-worker-audit.md).

Branch `codex/jmb-rest-performance`, baseada em `e93edf4`. Nenhuma mudança staged, nenhum commit/push/PR/merge/deploy e nenhuma edição do WordPress remoto.

| Verificação | Resultado |
| --- | --- |
| `pnpm typecheck` | Passou, inclusive o contexto usado pelo canonical de 404 |
| `pnpm lint` | Passou |
| `pnpm test` | 123 testes passaram; 1 medição opt-in ignorada na suíte normal |
| `pnpm build` | Passou para cliente e SSR com adapter Cloudflare; Worker/configuração gerados em `dist/server` |
| `pnpm test:ssr` | Passou no servidor local Cloudflare/TanStack com WordPress real |
| Medição real antes/depois | 13 rotas, frio/quente; hashes de dados públicos e HTML iguais; HTTP e bytes reduzidos em todas; zero HTTP quente |
| Regressão estática | 19 cenários aprovados passaram; snapshots não alterados |
| `git diff --check` | Passou |

O teste SSR cobre 17 URLs com HTTP 200 e 5 cenários 404, conteúdo real, busca e filtros combinados, vazio, paginação, redirects 301, normalização de barra, sitemap, robots e acesso aos dois assets oficiais. Verifica no HTML recebido: canonical único e correto (inclusive 404), OG title/description/type/url/image sem duplicação, imagem absoluta, Twitter large image, favicon único, fallback padrão, imagens individuais de produto/artigo/trabalho e noindex de 404. URLs 200 mantêm um H1.

Os testes novos verificam mídia completa sem HTTP extra, array nativo ACF (incluindo sizes em formato plano), resposta embutida WordPress, ID antigo/incompleto, vazios, attachment ausente, galeria duplicada/em ordem, Hero/CTA iguais/diferentes/mistos, taxonomia sem fundo, cache frio/quente/expiração, concorrência, falha de lote com fallback individual e reutilização dos dados de cidades. Testes anteriores de listagem, relacionados, regras comerciais e rotas continuam passando.

Na inspeção pelo navegador local, Home, catálogo e produto CFF-01 foram verificados a 375, 768, 1024 e 1440 px: sem overflow horizontal, um H1 por página e nenhuma imagem sem atributo alt. Os selects do catálogo têm labels. Menu mobile abriu e Produtos expandiu com Pronta entrega primeiro, seguido pelas categorias principais e link geral. A troca para a segunda imagem da galeria atualizou a seleção. O link de WhatsApp do produto preservou título, código e URL. Tab avançou do CTA ao próximo link do produto, com outline sólido de 3px no elemento focado. O console capturado não mostrou warnings/erros. A verificação responsiva não representa auditoria exaustiva de contraste/leitor de tela de todas as rotas; não houve mudança de CSS ou componentes visuais.

O primeiro build dentro da sandbox gerou os bundles, mas o Wrangler não conseguiu escrever seu log fora do workspace. O build final usou `WRANGLER_LOG_PATH` em `artifacts/wrangler-logs` e terminou sem esse erro. Não foi necessário alterar configuração do projeto nem executar deploy.

Limitações: não medimos TTFB em produção nem invalidamos caches remotos por edição de conteúdo. A configuração/invalidação ativa do WP REST Cache não é comprovável somente pelos GETs públicos. Antes de publicar, validar alterações reais de conteúdo, attachments, ACF, taxonomias e site-config no ambiente autorizado; os detalhes e o rollback estão no [relatório técnico](../rest-performance.md).

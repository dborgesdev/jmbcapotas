# JMB Capotas

V1 do catálogo headless: TanStack Start, React, TypeScript e Tailwind, com SSR em Cloudflare Workers. O conteúdo vem da REST pública do WordPress; carrinho local e conversão pelo WhatsApp.

## Executar

Requer Node >= 22.12 e pnpm 12.9.1.

```sh
pnpm install
pnpm dev
```

Abra http://127.0.0.1:3000/. Para avaliar o bundle de produção:

```sh
pnpm build
pnpm preview
```

As URLs padrão estão centralizadas em `src/lib/config.ts`. Opcionalmente copie `.env.example` para `.env` antes de iniciar/buildar. Somente as duas URLs públicas são incluídas na configuração de build; nenhuma credencial do WordPress é necessária.

## Validação

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:ssr
```

`test:ssr` requer o servidor rodando em 3000; para outra porta, defina `TEST_BASE_URL`. O smoke test usa os conteúdos publicados na auditoria da V1 (Fiat/Strada, Curitiba e trabalho publicado) e precisa acompanhar futuras alterações desses cadastros.

O build produz `dist/client` e `dist/server/wrangler.json`. A configuração segue o [adapter oficial TanStack Start / Cloudflare](https://tanstack.com/start/latest/docs/framework/react/guide/hosting). Validação sem publicar:

```sh
pnpm exec wrangler deploy --dry-run --config dist/server/wrangler.json
```

`pnpm deploy` exige conta/autenticação e publica o Worker. Nenhum deploy foi realizado na entrega da V1.

## Conteúdo e rotas

- Home sem produtos em destaque, com entrada por marca e linhas dinâmicas.
- Catálogo `/produtos/`, categorias `/produtos/{slug}/`, marcas `/marcas/capota-de-fibra-para-{marca}/` e filtros por modelo.
- Capota de fibra com modelo: `/capota-para-picape/{slug}/`; demais produtos: `/produtos/{slug}/`.
- Pronta entrega `/pronta-entrega/`, carrinho `/carrinho/`, trabalhos `/trabalhos/`, blog `/blog/` e cidades `/cidades/`.
- Pages nativas na raiz pelo slug original; cidades com prefixo histórico. Entidades inexistentes retornam 404 e aliases de produto usam 301 para a URL canônica.

Novos termos e conteúdos publicados entram pelo CMS. As referências de produto/trabalho não dependem de seleção ou destaque da Home. Veja `docs/v1-validation.md` para limitações reais de conteúdo e notas técnicas.

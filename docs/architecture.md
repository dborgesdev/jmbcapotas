# JMB Capotas — Arquitetura

## Stack
- TanStack Start + React + TypeScript.
- Tailwind CSS diretamente nos componentes.
- pnpm e pnpm-lock.yaml.
- SSR porque produtos, marcas/modelos, cidades, posts e pages são dinâmicos e SEO é requisito central.
- Target preferencial: Cloudflare Workers.

## Separação
Frontend público: jmbcapotas.com.br
CMS: painel.jmbcapotas.com.br
REST: painel.jmbcapotas.com.br/wp-json/wp/v2/

WordPress é CMS/API. Não depender de templates WordPress para o frontend público.

## Camada de dados
Centralizar acesso em src/lib/wordpress, com tipos e normalização. Componentes não devem conhecer detalhes crus da REST API.

Sugestão:
src/lib/wordpress/client.ts
src/lib/wordpress/types.ts
src/lib/wordpress/media.ts
src/lib/wordpress/products.ts
src/lib/wordpress/taxonomies.ts
src/lib/wordpress/cities.ts
src/lib/wordpress/pages.ts
src/lib/wordpress/posts.ts
src/lib/wordpress/works.ts

Normalizar HTML, mídia, ACF e termos antes de entregar aos componentes.

## Endpoints confirmados
/wp-json/wp/v2/produto
/wp-json/wp/v2/cidade
/wp-json/wp/v2/trabalho
/wp-json/wp/v2/marca
/wp-json/wp/v2/modelo
/wp-json/wp/v2/categoria_produto
/wp-json/wp/v2/pages
/wp-json/wp/v2/posts
/wp-json/wp/v2/media

Usar parâmetros REST para slug, taxonomia, paginação e busca quando suportados.

## Mídia
featured_media e campos ACF de imagem retornam IDs no estado atual. Resolver via Media API e aplicar cache/deduplicação. Não disparar fetch repetido do mesmo media ID em uma renderização.

Galeria do produto/trabalho:
featured_media + acf.galeria.imagem_2 + imagem_3 + imagem_4 + imagem_5.
Ignorar null/string vazia.

## Busca e catálogo
Não carregar catálogo inteiro no cliente. Projetar consultas paginadas/server-side.
Filtros: categoria_produto, marca, modelo.
Modelo possui acf.marca, usado para montar dependência Marca -> Modelos.
Busca deve considerar REST/API e, se necessário, uma camada server-side; não criar índice paralelo antes de necessidade comprovada.

## Carrinho
Estado no frontend, persistido em localStorage.
Item mínimo: productId, slug, name, codigo?, image?, quantity, publicUrl.
Sem autenticação e sem banco.

## WhatsApp
Centralizar construção de URL/mensagem em src/lib/whatsapp.
Nunca duplicar número/mensagem por componentes.
Comprar agora usa produto atual.
Finalizar carrinho serializa itens e quantidades.

## Cache e resiliência
Aplicar cache compatível com o runtime para conteúdo público do WordPress. Conteúdo administrativo não existe no frontend.
Tratar timeout/falha parcial: falha de blog/trabalhos não deve necessariamente derrubar Home.
Entidades inexistentes devem responder HTTP 404 real.

## Segurança
Nenhuma credencial administrativa WordPress no browser.
Sanitizar/renderizar com segurança content.rendered.
Não expor secrets em variáveis PUBLIC.
CORS e runtime devem ser validados no deploy.

## SEO dinâmico
Metadados produzidos server-side por rota.
Descrição curta/meta description pode ser derivada do conteúdo limpo e truncado.
Sitemap deve refletir conteúdo do CMS sem exigir alteração manual a cada cadastro.

## Estrutura sugerida
src/
  components/
    layout/
    home/
    products/
    catalog/
    cart/
    works/
    blog/
    ui/
  routes/
  lib/
    wordpress/
    cart/
    whatsapp/
    seo/
  data/
  styles/

Evitar dependências sem uso concreto e abstrações prematuras.

## Variáveis
Definir conforme implementação. Esperado:
WORDPRESS_API_URL=https://painel.jmbcapotas.com.br/wp-json/wp/v2
PUBLIC_SITE_URL=https://jmbcapotas.com.br
WhatsApp pode ficar em configuração central do projeto enquanto não houver opção global no CMS.

## Deploy
Validar adapter/runtime TanStack Start para Cloudflare Workers antes de considerar arquitetura concluída. Não criar servidor Node customizado como requisito quando Workers resolverem.

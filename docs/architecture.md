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
/wp-json/wp/v2/site-config

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

## Conversão
Sem carrinho, estado global de seleção ou localStorage. `/carrinho/` retorna 301 para `/produtos/` pela camada central de redirecionamentos.

## WhatsApp
Centralizar construção de URL/mensagem em src/lib/whatsapp.
Nunca duplicar número/mensagem por componentes.
Comprar agora usa produto atual.
Mensagens contextuais preservam nome, código e URL do produto.

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

## Estrutura adotada na V1
src/
  components/
    layout/
    home/
    products/
    catalog/
    works/
    blog/
    common/
  pages/
  routes/
  lib/
    wordpress/
    site/
    whatsapp.ts
    seo.ts
  styles/

Evitar dependências sem uso concreto e abstrações prematuras.

### Responsabilidades e composição

- `components/layout`: Header, menu mobile, Footer, Logo e composição do layout público.
- `components/home`: HeroSection, BrandSelector, CategorySection, InstitutionalSection, WorksSection, BlogSection e FinalCta, cada seção em arquivo próprio. `pages/Home.tsx` apenas compõe essas seções.
- `components/products`: cards/grid, galeria com estado, informações, ações de compra pelo WhatsApp e produtos relacionados.
- `components/catalog`: cabeçalho, navegação visual por modelos, filtros com estado dependente marca/modelo, paginação e composição compartilhada dos resultados.
- `components/works` e `components/blog`: apresentação dos respectivos domínios; filtros do blog, galeria e produtos associados a trabalhos.
- `components/common`: mídia responsiva, breadcrumbs, estados vazios, cabeçalho editorial e renderização de dados estruturados.
- `pages`: composição explícita de Home, catálogo, marca, categoria, pronta entrega, produto, trabalhos, trabalho individual, blog, artigo, cidades, cidade, Page nativa, 404 e erro. Categoria/pronta entrega compartilham a apresentação do catálogo sem duplicar filtros ou consultas.
- `components/site.tsx`: dispatcher pequeno; escolhe a página e delega a composição ao SiteLayout. Não contém implementações de páginas ou seções.
- `routes`: integração TanStack Start, SSR, metadata, endpoints públicos de sitemap e robots. As URLs históricas continuam atendidas pela rota dinâmica existente.
- `lib/wordpress`: transporte/cache em `client`, sanitização em `html`, resolução de mídia em `media`, normalização comum em `normalize`, mecânica de consulta em `query`, classificação/URLs de produtos em `product-urls` e acesso a conteúdo nos módulos `products`, `taxonomies`, `cities`, `pages`, `posts`, `works`. Normalização comum recebe a URL definida pelo domínio; não decide qual domínio está consultando.
- `lib/site`: tipos compartilhados, contexto público resiliente, resolução das URLs e loaders por domínio. `wordpress/site.ts` só expõe a server function que chama o resolvedor. O resolvedor identifica a rota e delega; busca, pronta entrega, relações de produtos e carregamento das seções não ficam nele.

**Não concentrar múltiplas páginas, seções independentes ou componentes de domínio em arquivos monolíticos. Manter componentes/seções relevantes em arquivos próprios e separar acesso a dados por domínio. Arquivos agregadores devem apenas compor/orquestrar.**

Não criar barrels ou wrappers sem responsabilidade apenas para preencher a árvore. Componentes pequenos podem permanecer juntos quando não representam uma seção independente nem têm comportamento próprio. Não mover um monólito inteiro para outro nome/diretório.

### Proteção contra regressões

`tests/render-regression.test.tsx` compara hashes do HTML estático de 19 cenários com a referência aprovada da V1, incluindo Home com/sem conteúdo, catálogos/filtros/paginação, marca, categoria, pronta entrega, produto com/sem mídia, páginas editoriais e listas vazias. Os snapshots preservam markup, classes Tailwind, links e dados estruturados. Não atualizar os snapshots para acomodar uma refatoração estrutural que deveria preservar a apresentação. Os dados sintéticos desses testes nunca são usados no site.

Testes REST/domínio cobrem sanitização, URLs históricas, ACF gratuito, mídia indisponível, cache, paginação, filtros e WhatsApp. `pnpm test:ssr` valida as principais URLs contra um servidor local e o WordPress real; typecheck, lint e build de produção continuam obrigatórios.

## Variáveis
Definir conforme implementação. Esperado:
WORDPRESS_API_URL=https://painel.jmbcapotas.com.br/wp-json/wp/v2
PUBLIC_SITE_URL=https://jmbcapotas.com.br
Dados institucionais/comerciais vêm exclusivamente do CPT `site-config` do WordPress.

## Deploy
Validar adapter/runtime TanStack Start para Cloudflare Workers antes de considerar arquitetura concluída. Não criar servidor Node customizado como requisito quando Workers resolverem.

## Refinamento visual da V1

- `home/HeroSection` usa exclusivamente a mídia `site-config.hero`, priorizada no SSR; sem vídeo ou fallback de catálogo. `CategoryCard` usa exclusivamente `acf.imagem`; `catalog/CategoryHero` usa `acf.imagem_fundo`.

## Configuração pública global

`wordpress/site-config` consulta o slug publicado, normaliza contatos, valida URLs e e-mail, resolve IDs de mídia com deduplicação e entrega `SiteConfig`. Usa transporte existente (cache público de 60s, requisições concorrentes deduplicadas, timeout), compatível com SSR/Workers. Falha retorna configuração vazia, com fundos neutros e sem inventar contatos/parcelamento.

`site/context` inclui configuração nos dados das rotas; `PublicConfigContext` distribui dados normalizados e contexto de produto/marca já resolvido. Componentes não consultam ACF. `contacts`, `payment` e `whatsapp` centralizam normalização, condições e mensagens. `FloatingWhatsApp` não consulta WordPress. Hero e CTA final usam imagens independentes. `NavigationDropdown` compartilha abertura/fechamento/acessibilidade entre Produtos (somente categorias principais com parent === 0, inclusive count zero, sem limite) e Empresa (Quem Somos e A Fábrica). `lib/categories.categoryTree` centraliza a travessia hierárquica com irmãos em ordem pt-BR/ID e tolera ciclos/pais ausentes sem duplicação. Filtros usam todos os nós com prefixo por profundidade; `categoryNavigation` usa somente parent === 0. `site/catalog-search.catalogDestination` calcula a rota no Buscar: páginas de categoria navegam à nova categoria ou catálogo geral, enquanto marca/pronta entrega preservam sua rota; normaliza filtros compatíveis e remove paginação. Categoria da rota inicializa o select habilitado e não se repete na query da rota de categoria. Home e catálogo geral compartilham `catalog/BrandLogoGrid`: variante padrão preserva o HTML da grade da Home; compacta usa colunas responsivas, logos sem nomes repetidos e fallback textual quando falta mídia. `home/BrandSelector` mantém a composição editorial original e catálogo usa a grade diretamente. Desktop abre por PointerEnter de mouse com capacidade hover/fine, mantém dropdown contíguo ao gatilho e fecha por PointerLeave; mobile/touch conserva clique/teclado. A coleção de categorias é a mesma do contexto/Home, sem filtro por count nem consultas extras.

`BrandHero` ocupa a viewport quando há imagem de fundo; sem imagem mantém `CatalogHeader`. Troca de marca usa TanStack Router, preserva busca/categoria válida, preserva apenas modelo compatível e remove paginação.
- `home/ClientsMarquee` apresenta logos resolvidos por `wordpress/clients`, sem consultas no componente e sem links presumidos.
- `products/ProductAvailability` e `PaymentConditions` apresentam os estados comerciais; compatibilidade e seleção de relacionados ficam em `wordpress/related` e `products`.
- `lib/site/introduction` prioriza descrições nativas, conteúdo editorial normalizado e fallback específico por página.
- Nesta rodada de mudanças visuais explicitamente solicitadas, os 19 snapshots foram atualizados após testes de comportamento e inspeção visual. Refatorações futuras continuam obrigadas a preservar essa referência sem atualização automática.

## Navegação e Page de conserto

`categoryNavigation` adiciona Pronta entrega antes das categorias principais, com divisores na primeira categoria e no link geral final. Conserto de Capotas é link independente na navegação compartilhada desktop/mobile; Empresa conserva suas opções e mecanismo de dropdown.

`site/pages` carrega a Page por slug, reutilizando o conteúdo já normalizado no contexto quando disponível e consultando por slug como fallback. Somente conserto-de-capotas-de-fibra carrega `site/works.recentWorks`, também usado pela Home: consulta paginada de três trabalhos com transporte/cache existentes; falha retorna lista vazia. `WordPressPage` compõe WorksSection fora do article/wrap, antes do Footer, exclusivamente para esse slug. O componente e estilos da seção da Home permanecem iguais.

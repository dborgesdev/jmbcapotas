# JMB Capotas — Especificação do Projeto

## Status
Especificação consolidada para implementação da V1. Este documento é fonte de verdade funcional. Não inventar fatos empresariais nem alterar decisões sem necessidade técnica ou solicitação.

## URLs e infraestrutura confirmadas
- Site público: https://jmbcapotas.com.br/
- WordPress headless: https://painel.jmbcapotas.com.br/
- REST base: https://painel.jmbcapotas.com.br/wp-json/wp/v2/
- Repositório: dborgesdev/jmbcapotas
- Telefone e WhatsApp públicos vêm do CPT `site-config`, slug `jmb-capotas`; não duplicar em componentes.
- Frontend: React + TypeScript + Tailwind CSS + TanStack Start com SSR.
- Package manager: pnpm.
- Deploy pretendido para SSR: Cloudflare Workers, salvo incompatibilidade técnica concreta.

## Objetivo
Substituir o site atual por uma experiência moderna, visualmente forte e responsiva, mantendo as estruturas de URL historicamente relevantes. O site será catálogo administrável, não e-commerce transacional. O WordPress fornece conteúdo e o frontend controla experiência, roteamento, SEO e apresentação.

O catálogo deve aceitar capotas e novas categorias como acessórios, peças, materiais de instalação, reposição, racks, internas e futuras categorias cadastradas no WordPress.

## Conversão
Conversão principal: WhatsApp.

Produto individual:
- Comprar agora abre WhatsApp com mensagem personalizada contendo nome do produto e identificação suficiente.
- Adicionar ao carrinho adiciona item a carrinho local.

Carrinho:
- sem login, pagamento, estoque, frete ou WooCommerce;
- persistência local;
- quantidade e remoção;
- finalizar gera mensagem contendo todos os itens e abre WhatsApp.

Mensagem base, ajustável no código:
"Olá, vim do site da JMB Capotas e quero comprar o produto {produto}."
Carrinho deve listar itens/quantidades. Incluir código do produto e URL quando disponíveis.

## Home e direção de layout
Referência visual aprovada para direção: site da fábrica Walumar. Usar como referência de ritmo, escala e linguagem do segmento, NÃO como layout a copiar e NÃO mencionar no site que a Walumar é a fábrica/representada da JMB.

Características que devem ser traduzidas para a identidade JMB:
- seções visualmente amplas, com fotografia/vídeo automotivo em grande escala e, quando adequado, como background;
- conteúdo centralizado sobre imagem nas seções de impacto;
- alternância entre blocos escuros e áreas claras para ritmo e legibilidade;
- composição mais editorial/automotiva que "grade de cards";
- pouco ruído visual e foco em veículo, produto, categoria e ação;
- vermelho JMB como assinatura/ação, não como grandes massas de fundo.

Ordem funcional:
1. Header enxuto, sobreposto/transparente no topo do Hero quando a legibilidade permitir; ao navegar, manter acesso claro a Produtos, Empresa, Galeria/Trabalhos, Blog, Contato, busca, carrinho e WhatsApp. Mobile: logo, busca/carrinho e menu compacto.
2. Hero quase full-screen com imagem real de `site-config.hero`, sem vídeo; fundo neutro quando ausente. Conteúdo objetivo, centralizado, com H1 forte e CTAs para Produtos e WhatsApp.
3. Seletor de marcas IMEDIATAMENTE após o Hero, com logos reais vindos da taxonomia Marca. Clique abre a página da marca. Esta é a principal porta de entrada do catálogo na Home.
4. CTA "Ver todos os produtos" para /produtos/.
5. Categorias/linhas: apresentação editorial e visual das principais categorias cadastradas, usando imagem/imagem_fundo da taxonomia quando disponíveis. Não confundir esta seção com produtos em destaque.
6. Bloco institucional: apresentar JMB e proposta de valor apenas com fatos suportados pelo conteúdo disponível; fotografia real quando usada.
7. Trabalhos/galeria: composição visual baseada no CPT Trabalho e somente imagens reais.
8. Blog/conteúdo: entradas recentes quando houver conteúdo publicado; a ausência de posts não pode quebrar a Home.
9. CTA final WhatsApp em seção visual de alto impacto, preferencialmente com background real apropriado.
10. Footer claro e organizado, com navegação de catálogo, institucional, contato e links relevantes.

Produtos individuais NÃO aparecem na Home como "produtos em destaque". Não existe campo destaque e não deve ser criado.

### Tipografia, composição e movimento
- Sans-serif contemporânea, forte e legível, adequada ao universo automotivo/industrial.
- Hero H1 com escala aproximada de 56–72 px no desktop e 38–46 px no mobile, ajustada responsivamente conforme a fonte/composição.
- Hierarquia tipográfica marcada, bastante espaço negativo e imagens como parte estrutural do layout.
- Motion moderado: entradas sutis, hover e transições funcionais. Sem parallax pesado ou animações que prejudiquem performance.
- Respeitar prefers-reduced-motion.
- Evitar glassmorphism, glow/neon, gradientes decorativos gratuitos, excesso de sombras/cards e estética SaaS/template/IA.

## Navegação por veículo
Ao selecionar uma marca, abrir página da marca. Ela deve mostrar os modelos daquela marca com imagem/nome, busca e produtos correspondentes. Selecionar modelo filtra produtos.

A página geral /produtos/ contém:
- busca;
- filtros Categoria > Marca > Modelo;
- Modelo dependente da Marca;
- cards de produtos;
- paginação/consulta server-side; não baixar 500–600 produtos para filtrar no navegador.

## Produto
Página individual:
- breadcrumb;
- galeria: imagem destacada + ACF galeria.imagem_2..imagem_5, ignorando vazios;
- categoria;
- título;
- código quando existir;
- marca/modelo;
- conteúdo nativo WordPress;
- Comprar agora;
- Adicionar ao carrinho;
- produtos relacionados quando houver regra consistente.

Descrição curta em cards deve ser derivada no frontend dos primeiros caracteres de content.rendered, removendo HTML. Não existe campo de resumo/excerpt no modelo adotado.

## Pronta entrega
Produto possui ACF pronta_entrega boolean. Página intitulada “Produtos a pronta entrega”, usando este estado comercial em vez de categoria artificial, sem restringir o catálogo a capotas.

## Categorias
Categorias são dinâmicas e hierárquicas. O frontend não pode hardcodar apenas as categorias iniciais. Novas categorias/subcategorias cadastradas no WordPress devem ser suportadas.

## Trabalhos
Área de trabalhos/galeria alimentada pelo CPT trabalho, com imagens reais. Pode relacionar produto, marca e modelo conforme API. Nunca usar imagem gerada como prova de instalação, produto entregue, sede, equipe ou resultado real.

## Cidades
Páginas locais dinâmicas pelo CPT cidade.
- título nativo = cidade;
- editor nativo = conteúdo;
- imagem destacada quando existir;
- ACF estado.
SEO é gerado pelo frontend a partir desses dados. Não exigir campos SEO no WordPress.
Pode haver conteúdo padrão inicial, editável posteriormente pelo cliente.

## Blog
Consumir Posts nativos do WordPress:
- índice;
- artigo;
- categorias;
- imagem destacada;
- conteúdo.
Resumos de cards derivados do conteúdo quando necessários.

## Páginas estáticas
Consumir Pages nativas do WordPress por slug original:
GET /wp-json/wp/v2/pages?slug={slug}

Usar title.rendered, content.rendered, featured_media e slug. Preservar os slugs públicos históricos das páginas estáticas cadastradas. Páginas esperadas incluem Quem Somos, A Fábrica, Por que a JMB Capotas e Contato, conforme forem cadastradas.

## Condição comercial
Condição comercial vem de `site-config.parcelamento` e `sem_juros`. Omitir menos de 2 parcelas ou valores inválidos. Com boolean `true`: “Parcelamento em até {n}x sem juros”; nos demais casos: “Parcelamento em até {n}x. Consulte condições de pagamento.” WordPress é fonte de verdade institucional e comercial.

## Ajustes de navegação e contato

- Produtos: dropdown desktop por clique e teclado; submenu expansível mobile. Cinco marcas por nome/ID da taxonomia e link geral; Galeria mantém `/trabalhos/`.
- Home: imagens independentes do Hero e CTA final vêm de `site-config`; sem imagens locais/derivadas de trabalhos.
- Marca: imagem de fundo em toda a largura, descrição nativa e troca de marca pela URL histórica, preservando filtros compatíveis.
- Footer: contatos, endereço/mapa e redes do CMS; omitir vazios e restaurar “Feita para acompanhar você.”
- WhatsApp flutuante: contexto já resolvido de produto/marca, com mensagens centralizadas; carrinho mantém mensagem de seleção.

## Direção visual
- marca JMB como base;
- preto/grafite, branco, vermelho da marca e cinzas neutros;
- fotografia/vídeo em grande escala;
- forte apresentação automotiva;
- conteúdo centralizado onde fizer sentido;
- evitar aparência SaaS/template/IA, glassmorphism gratuito, neon e excesso de cards/animações;
- motion moderado e prefers-reduced-motion.

## Assets
Priorizar assets reais do cliente para produtos, trabalhos, sede, equipe, veículos e instalações. Não usar placeholders na V1 final. Logos de marcas devem ser tratados sem distorção.

## SEO
SSR para páginas indexáveis. Implementar:
- title e meta description;
- canonical;
- OG/Twitter;
- robots.txt;
- sitemap dinâmico;
- favicon;
- headings semânticos;
- BreadcrumbList quando aplicável;
- Product/Article/Organization/LocalBusiness somente quando os dados verificáveis suportarem.
Não inventar preço, estoque, review, rating ou oferta.

## Responsividade e acessibilidade
Validar pelo menos 375, 768, 1024 e 1440 px, além de comportamento em telas estreitas.
Sem overflow horizontal.
Teclado, foco visível, alt, contraste, labels e reduced motion.
Filtros e carrinho devem funcionar plenamente no mobile.

## Fora de escopo V1
Pagamento online, WooCommerce, frete, estoque transacional, login/conta de cliente, pedidos, área do cliente, gateway, ERP e CRM.

## Critérios de aceite
V1 deve permitir navegar Home; marcas/modelos; catálogo; busca/filtros; produto; Comprar Agora; carrinho/WhatsApp; pronta entrega; cidades; páginas estáticas; trabalhos; blog/artigos; 404 real; SSR/metadados; mobile.

Antes de produção executar e registrar: typecheck, lint, build, testes existentes/relevantes, console, links/CTAs, API, 404, sitemap, robots, canonical, metadados, responsividade, teclado/foco e compatibilidade do deploy.

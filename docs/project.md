# JMB Capotas — Especificação do Projeto

## Status
Especificação consolidada para implementação da V1. Este documento é fonte de verdade funcional. Não inventar fatos empresariais nem alterar decisões sem necessidade técnica ou solicitação.

## URLs e infraestrutura confirmadas
- Site público: https://jmbcapotas.com.br/
- WordPress headless: https://painel.jmbcapotas.com.br/
- REST base: https://painel.jmbcapotas.com.br/wp-json/wp/v2/
- Repositório: dborgesdev/jmbcapotas
- WhatsApp: usar o mesmo número atualmente publicado no site antigo; centralizar em configuração e confirmar/obter o valor no legado antes de produção.
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

## Home
Direção inspirada no ritmo visual da Walumar informado pelo cliente, sem copiar identidade/layout. Usar imagens e vídeos como fundos quando houver material adequado, conteúdo centralizado e linguagem automotiva/industrial contemporânea.

Ordem funcional:
1. Header.
2. Hero visual de alto impacto.
3. Seletor de marcas imediatamente após o Hero, com logos.
4. CTA "Ver todos os produtos" para /produtos/.
5. Apresentação das principais categorias/linhas.
6. Bloco institucional.
7. Trabalhos/galeria.
8. Conteúdo/blog quando adequado.
9. CTA final WhatsApp.
10. Footer.

Produtos individuais NÃO possuem campo de destaque e não devem depender de uma seção "produtos em destaque" na Home.

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
Produto possui ACF pronta_entrega boolean. Criar experiência/página de capotas em pronta entrega conforme solicitação do cliente, usando este estado comercial em vez de categoria artificial.

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
Remover comunicação antiga de "10x sem juros". Solicitação atual: comunicar parcelamento em até 12x sem afirmar "sem juros". Formulação segura: "Parcelamento em até 12x. Consulte condições de pagamento."

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

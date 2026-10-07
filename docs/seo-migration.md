# JMB Capotas — URLs e Migração SEO

## Princípio
Não preservar todas as URLs recuperadas do site antigo. Preservar páginas estáticas relevantes e as estruturas principais explicitamente definidas. Não redirecionar em massa URLs sem equivalente para a Home.

## Site
Origem pública: https://jmbcapotas.com.br/
CMS: https://painel.jmbcapotas.com.br/

## Páginas estáticas
As Pages nativas do WordPress serão cadastradas com slug original e expostas na raiz:
https://jmbcapotas.com.br/{slug-original}/

Frontend:
GET https://painel.jmbcapotas.com.br/wp-json/wp/v2/pages?slug={slug}

Se não houver page correspondente nem outra rota conhecida, responder 404 real.

## Marcas — estrutura histórica principal
Preservar:
 /marcas/capota-de-fibra-para-{marca}/

Exemplo confirmado:
 /marcas/capota-de-fibra-para-volkswagen/

A página usa a taxonomia marca e deve apresentar modelos daquela marca, busca/filtros e produtos pertinentes.

## Produtos — capotas de fibra para veículo
Quando o produto for capota de fibra para veículo específico, preservar:
 /capota-para-picape/{slug-produto}/

Exemplo confirmado:
 /capota-para-picape/capota-de-fibra-com-portas-folha-dupla-2016-volkswagen-amarok/

A determinação deve usar a categoria/classificação real do produto, não substring frágil no título.

## Demais produtos
Novos produtos que não pertençam à regra histórica acima:
 /produtos/{slug-produto}/

Catálogo:
 /produtos/

Categorias:
 /produtos/{slug-categoria}/
A rota exata pode ser ajustada apenas se houver conflito técnico/SEO documentado.

## Cidades
WordPress armazena slug simples:
 adrianopolis
 curitiba
 londrina

Frontend publica:
 /venda-de-capota-para-picape-em-{cidade}/

Exemplo:
 /venda-de-capota-para-picape-em-adrianopolis/

Consulta:
 /cidade?slug=adrianopolis

Não exigir que o editor cadastre o prefixo inteiro no slug do WordPress.

## Blog
Índice:
 /blog/

Artigos novos:
 /blog/{slug}/

Conteúdo histórico relevante com URL diferente deve ser avaliado individualmente quando for republicado; não criar redirecionamentos especulativos.

## Canonical e status
- Conteúdo preservado: 200 na URL pública definida.
- Equivalente real com URL alterada: 301 explícito.
- Sem equivalente: 404/410 conforme caso.
- Nunca 200 com página vazia.
- Nunca redirecionar todo legado para a Home.

## Sitemap
Gerar dinamicamente apenas URLs canônicas/indexáveis:
- pages estáticas publicadas;
- produtos;
- marcas/modelos quando indexáveis;
- categorias relevantes;
- cidades;
- posts.

## SEO automático de cidades
Derivar do título/conteúdo nativos e estado:
- H1 adequado à intenção local;
- title;
- meta description a partir do conteúdo limpo;
- canonical da URL pública.
Não exigir preenchimento SEO no WordPress.

## Redirects
Manter redirects explícitos em fonte estruturada/configuração de runtime quando necessários. Não espalhar condicionais por componentes React.

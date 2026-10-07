# JMB Capotas — Modelo WordPress confirmado

Base REST: https://painel.jmbcapotas.com.br/wp-json/wp/v2/

O projeto usa ACF gratuito. Não exigir Gallery, Repeater, Options Page ou Relationship do ACF Pro. A configuração abaixo reflete as respostas reais fornecidas pelo painel.

## CPT produto
Endpoint: /produto

Nativos:
- title.rendered
- slug
- content.rendered
- featured_media

Taxonomias:
- categoria_produto: array de IDs
- marca: array de IDs
- modelo: array de IDs

ACF:
- codigo_produto: string
- pronta_entrega: boolean
- galeria: Group
  - imagem_2: media ID ou vazio
  - imagem_3: media ID ou vazio
  - imagem_4: media ID ou vazio
  - imagem_5: media ID ou vazio

Não existe campo de informações adicionais. Toda descrição/características editoriais pertencem a content.rendered.
Não existe campo destaque.
Ordenação editorial é controlada no painel por plugin Posts Order.

Exemplo confirmado: produto 44 retorna codigo_produto CFF-01, pronta_entrega true e galeria agrupada.

## Taxonomia categoria_produto
Endpoint: /categoria_produto
Hierárquica: sim.

Nativos:
- id
- name
- slug
- description
- parent
- count

ACF:
- imagem: media ID/null
- imagem_fundo: media ID/null

Novas categorias e subcategorias devem funcionar sem alteração de código.

## Taxonomia marca
Endpoint: /marca
Associada a produto e trabalho.

Nativos:
- id
- name
- slug
- description
- count

ACF:
- logo: media ID
- imagem_fundo: media ID ou vazio

## Taxonomia modelo
Endpoint: /modelo
Associada a produto e trabalho.

Nativos:
- id
- name
- slug
- description
- count

ACF:
- marca: ID do termo marca
- imagem: media ID

A relação marca -> modelo é obtida por acf.marca. Exemplo confirmado: modelo "Strada 2020-26" tem marca 4 (Fiat).

## CPT cidade
Endpoint: /cidade

Nativos:
- title.rendered = nome da cidade
- slug = slug simples, ex. curitiba
- content.rendered = conteúdo SEO/local completo
- featured_media

ACF:
- estado: UF, ex. PR

Não existem campos SEO. Frontend gera title, meta description, canonical e H1 conforme regra de rota/conteúdo.

## CPT trabalho
Endpoint: /trabalho

Nativos:
- title.rendered
- slug
- content.rendered
- featured_media

Taxonomias:
- marca
- modelo

ACF:
- produto: array de IDs de produto (relação já configurada e exposta na REST)
- galeria: Group
  - imagem_2
  - imagem_3
  - imagem_4
  - imagem_5

A relação acf.produto deve ser preservada; a API atual também expõe acf:post em _links.

## Posts
Endpoint: /posts
Usar recursos nativos: título, slug, editor, imagem destacada, categorias e data.
Não depender de excerpt; resumo de cards pode ser derivado de content.rendered.

## Pages
Endpoint: /pages
Usar título, slug, editor e imagem destacada.
Frontend deve consultar página por slug:
GET /pages?slug={slug}

Páginas estáticas do legado serão cadastradas como Pages com seus slugs originais.

## Media
Endpoint: /media/{id}
Todos os IDs de mídia devem ser resolvidos por esta API ou via _embed quando tecnicamente mais eficiente. Implementação deve tolerar 0, null e string vazia em campos opcionais.

# AGENTS.md — JMB Capotas

Leia antes de implementar:
- docs/project.md
- docs/architecture.md
- docs/wordpress-content-model.md
- docs/seo-migration.md

Regras:
1. Stack: TanStack Start + React + TypeScript + Tailwind; pnpm.
2. WordPress headless é a fonte de conteúdo. Não invente dados empresariais.
3. Consumir a REST real em https://painel.jmbcapotas.com.br/wp-json/wp/v2/.
4. Respeitar exatamente CPTs, taxonomias e ACF documentados; projeto usa ACF gratuito.
5. Não adicionar campos/CPTs nem depender de ACF Pro sem aprovação.
6. Preservar as rotas públicas definidas em seo-migration.md.
7. Produtos não dependem de destaque na Home.
8. Carrinho é local e finaliza no WhatsApp; não implementar checkout/pagamento.
9. Descrição curta é derivada de content.rendered; não presumir excerpt.
10. Galeria = featured_media + acf.galeria.imagem_2..imagem_5.
11. Implementar V1 completa e navegável numa branch de implementação; não desenvolver mudanças significativas diretamente na main.
12. Priorizar assets reais; não apresentar imagem gerada como produto/trabalho/sede/equipe real.
13. Antes de declarar pronto: typecheck, lint, build, testes aplicáveis, rotas/404, responsividade, acessibilidade, SEO e deploy target.
14. Não alterar decisões aprovadas para “melhorar” arquitetura sem motivo técnico concreto e documentado.
15. Não concentrar múltiplas páginas, seções independentes ou componentes de domínio em arquivos monolíticos. Manter componentes/seções relevantes em arquivos próprios e separar acesso a dados por domínio. Arquivos agregadores devem apenas compor/orquestrar.

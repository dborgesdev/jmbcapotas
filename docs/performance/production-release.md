# Publicação de 29/10/2026 — preparação

O usuário confirmou `Worker exceeded CPU time limit` às 14:29:29, 14:29:31 e 14:29:40 BRT em produção (plano gratuito, 10 ms). A análise local é evidência comparativa, não comprovação de resolução do incidente.

As páginas de Saveiro (`capota-furgao-com-porta-traseira-horizontal-vw-saveiro`) e Defender (`capota-de-fibra-basica-para-land-rover-defender`) foram adicionadas aos testes SSR e à comparação offline entre main, otimização REST e versão final. Ambas passaram nos testes SSR com status 200 e metadados individuais.

Validação final: typecheck, lint, 129 testes aprovados (um teste de medição opt-in ignorado), build e SSR. O CI valida typecheck, lint, testes e build sem credenciais; SSR local usa replay do conteúdo público real, sem disparar carga no CMS.

Worker existente: `jmbcapotas`. Versão anterior para rollback: `bc31f340-6075-4c20-9d8b-d101f94c3820`, deployment `b84b4505-7e2d-42ff-82ee-64bf2b6070f1`, 100%. Snapshot privado de configurações preservado em artifacts/release (ignorado no Git). Domínios jmbcapotas.com.br e www.jmbcapotas.com.br; bindings vazios; compatibilidade 2026-10-07, nodejs_compat. A publicação preserva variáveis com --keep-vars e não altera WordPress.

Rollback autorizado em caso de regressão grave/indisponibilidade: `pnpm exec wrangler rollback bc31f340-6075-4c20-9d8b-d101f94c3820 --name jmbcapotas --message "Rollback da otimização por regressão em produção"`. Revalidar domínios e versão ativa após executá-lo.

Depois da publicação: verificação leve das duas páginas afetadas, rotas principais e logs, com métricas reais por versão. Não considerar o incidente definitivamente encerrado por ausência de erros em uma amostra pequena.

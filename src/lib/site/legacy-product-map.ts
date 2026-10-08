/**
 * Equivalências de produtos revisadas individualmente a partir da auditoria
 * histórica. Slugs não relacionados não devem cair em redirects genéricos.
 * O destino canônico é resolvido no WordPress pela classificação atual.
 */
export const legacyProductSlugs: Readonly<Record<string, string>> = {
  "capora-maritima-para-volkswagen-amarok": "capota-maritima-para-volkswagen-amarok",
  "capota-asa-de-gaivota-para-nissan-frontier": "capota-de-fibra-asa-de-gaivota-para-nissan-frontier",
  "capota-basica-para-ford-ranger": "capota-de-fibra-basica-para-ford-ranger",
  "capota-basica-para-land-rover-defender": "capota-de-fibra-basica-para-land-rover-defender",
  "capota-basica-para-peugeot-hoggar": "capota-de-fibra-basica-para-peugeot-hoggar",
  "capota-furgao-g4-para-volkswagen-saveiro": "capota-de-furgao-g4-para-volkswagen-saveiro",
};

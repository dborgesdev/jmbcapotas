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
  "capota-basica-para-amarok": "capota-de-fibra-basica-para-volkswagen-amarok",
  "capota-basica-para-corsa": "capota-de-fibra-basica-para-chevrolet-corsa",
  "capota-basica-para-f250": "capota-de-fibra-basica-para-ford-f250",
  "capota-basica-para-hilux": "capota-de-fibra-basica-para-toyota-hilux",
  "capota-basica-para-hoggar": "capota-de-fibra-basica-para-peugeot-hoggar",
  "capota-basica-para-saveiro": "capota-de-fibra-basica-para-volkswagen-saveiro",
  "capota-maritima-para-amarok": "capota-maritima-para-volkswagen-amarok",
  "tampao-maritimo-para-hilux": "tampao-maritimo-para-toyota-hilux",
  "tampao-maritimo-para-s10": "tampao-maritimo-para-chevrolet-s10",
  "capota-furgao-g5-para-volkswagen-saveiro": "capota-basica-de-furgao-g5-para-volkswagen-saveiro",
  "capota-g5-para-volkswagen-saveiro": "capota-de-fibra-basica-g5-para-volkswagen-saveiro",
  "capota-laterais-fechadas-para-volkswagen-saveiro": "capota-de-fibra-basica-com-laterais-fechadas-para-volkswagen-saveiro",
  "capota-vidros-fixos-para-volkswagen-saveiro": "capota-de-fibra-basica-com-vidros-fixos-para-volkswagen-saveiro",
  "capota-de-fibra-furgao": "capota-furgao",
  "capota-basica-para-land-rover": "capota-de-fibra-basica-para-land-rover-defender",
  "capota-2014-para-volkswagen-saveiro": "capota-de-fibra-basica-2014-para-volkswagen-saveiro",
};

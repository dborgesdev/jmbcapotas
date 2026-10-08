export const SITE = (
  import.meta.env.PUBLIC_SITE_URL || "https://jmbcapotas.com.br"
).replace(/\/$/, "");
export const API = (
  import.meta.env.WORDPRESS_API_URL ||
  "https://painel.jmbcapotas.com.br/wp-json/wp/v2"
).replace(/\/$/, "");

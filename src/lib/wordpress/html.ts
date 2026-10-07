import sanitizeHtml from "sanitize-html";
export function clean(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function safeHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading"],
      a: ["href", "title"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      h1: "h2",
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
    },
  });
}

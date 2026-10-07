import { SITE, WHATSAPP } from "./config";
export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  codigo?: string;
  image?: string;
  quantity: number;
  publicUrl: string;
};
export function whatsapp(
  message = "Olá, vim do site da JMB Capotas e gostaria de mais informações.",
) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}
export function buyMessage(p: {
  name: string;
  url: string;
  acf?: { codigo_produto?: string };
}) {
  return `Olá, vim do site da JMB Capotas e quero comprar o produto ${p.name}.${p.acf?.codigo_produto ? ` Código: ${p.acf.codigo_produto}.` : ""}\n${SITE}${p.url}`;
}
export function cartMessage(items: CartItem[]) {
  return `Olá, vim do site da JMB Capotas e quero comprar:\n\n${items.map((p) => `${p.quantity} × ${p.name}${p.codigo ? ` (código ${p.codigo})` : ""}\n${p.publicUrl}`).join("\n\n")}\n\nGostaria de consultar disponibilidade e condições de pagamento.`;
}

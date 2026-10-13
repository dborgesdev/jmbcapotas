import { SITE } from "./config";
import { brazilianPhone } from "./contacts";
export type WhatsAppContext = {
  product?: { name: string; url: string; acf?: { codigo_produto?: string } };
  brand?: string;
};
export function informationMessage(context?: WhatsAppContext) {
  if (context?.product) {
    const p = context.product;
    return `Olá, vim do site da JMB Capotas e gostaria de informações sobre o produto ${p.name}.${p.acf?.codigo_produto ? ` Código: ${p.acf.codigo_produto}.` : ""}\n${SITE}${p.url}`;
  }
  if (context?.brand)
    return `Olá, vim do site da JMB Capotas e gostaria de informações sobre os produtos para ${context.brand}.`;
  return "Olá, vim do site da JMB Capotas e gostaria de mais informações.";
}
export function whatsapp(
  message?: string,
  number?: string,
  context?: WhatsAppContext,
) {
  const phone = brazilianPhone(number);
  return phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message || informationMessage(context))}`
    : undefined;
}
export function buyMessage(p: {
  name: string;
  url: string;
  acf?: { codigo_produto?: string };
}) {
  return `Olá, vim do site da JMB Capotas e quero comprar o produto ${p.name}.${p.acf?.codigo_produto ? ` Código: ${p.acf.codigo_produto}.` : ""}\n${SITE}${p.url}`;
}

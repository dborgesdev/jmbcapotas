import { WhatsAppLink } from "../common/WhatsAppLink";
import { useSiteConfig } from "../../lib/site/config-context";
import { useWhatsApp } from "../../lib/site/config-context";
import { cartMessage, type CartItem } from "../../lib/whatsapp";
export function CartSummary({ items }: { items: CartItem[] }) {
  const whatsapp = useWhatsApp();
  const config = useSiteConfig();
  return (
    <aside className="h-fit bg-neutral-100 p-7">
      <h2 className="text-2xl font-bold">Vamos conversar?</h2>
      <p className="my-5 text-sm leading-6">
        Envie sua seleção para consultar disponibilidade e condições de
        pagamento com nossa equipe.
      </p>
      <p className="mb-5 text-sm">
        {items.reduce((n, p) => n + p.quantity, 0)} item(ns) selecionado(s)
      </p>
      <WhatsAppLink
        className="btn w-full"
        href={whatsapp(cartMessage(items))}
        target="_blank"
        rel="noopener noreferrer"
      >
        Finalizar no WhatsApp ↗
      </WhatsAppLink>
      <p className="mt-5 text-xs leading-5 text-neutral-600">
        {config.payment}
      </p>
    </aside>
  );
}

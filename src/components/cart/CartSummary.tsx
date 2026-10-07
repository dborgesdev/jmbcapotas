import { whatsapp, cartMessage, type CartItem } from "../../lib/whatsapp";
export function CartSummary({ items }: { items: CartItem[] }) {
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
      <a
        className="btn w-full"
        href={whatsapp(cartMessage(items))}
        target="_blank"
        rel="noreferrer"
      >
        Finalizar no WhatsApp ↗
      </a>
      <p className="mt-5 text-xs leading-5 text-neutral-600">
        Parcelamento em até 12x. Consulte condições de pagamento.
      </p>
    </aside>
  );
}

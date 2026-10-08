import { WhatsAppLink } from "../common/WhatsAppLink";
import { useWhatsApp } from "../../lib/site/config-context";
import { PaymentConditions } from "./PaymentConditions";
import { useCart } from "../../lib/cart/context";
import { buyMessage } from "../../lib/whatsapp";
import { type Post } from "../../lib/wordpress/types";
export function ProductActions({ p }: { p: Post }) {
  const whatsapp = useWhatsApp();
  const { add, notice } = useCart();
  return (
    <>
      <div className="mt-8 flex flex-col gap-3">
        <WhatsAppLink
          className="btn"
          href={whatsapp(buyMessage(p))}
          target="_blank"
          rel="noopener noreferrer"
        >
          Comprar agora pelo WhatsApp ↗
        </WhatsAppLink>
        <button className="btn-outline" onClick={() => add(p)}>
          Adicionar ao carrinho +
        </button>
      </div>
      {notice && (
        <p className="mt-4 text-sm">
          Adicionado!{" "}
          <a href="/carrinho/" className="underline">
            Ver carrinho →
          </a>
        </p>
      )}
      <PaymentConditions />
    </>
  );
}

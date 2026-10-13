import { WhatsAppLink } from "../common/WhatsAppLink";
import { useWhatsApp } from "../../lib/site/config-context";
import { PaymentConditions } from "./PaymentConditions";
import { buyMessage } from "../../lib/whatsapp";
import { type Post } from "../../lib/wordpress/types";
export function ProductActions({ p }: { p: Post }) {
  const whatsapp = useWhatsApp();
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
      </div>
      <PaymentConditions />
    </>
  );
}

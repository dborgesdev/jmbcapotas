import { useCart } from "../../lib/cart/context";
import { whatsapp, buyMessage } from "../../lib/whatsapp";
import { type Post } from "../../lib/wordpress/types";
export function ProductActions({ p }: { p: Post }) {
  const { add, notice } = useCart();
  return (
    <>
      <div className="mt-8 flex flex-col gap-3">
        <a
          className="btn"
          href={whatsapp(buyMessage(p))}
          target="_blank"
          rel="noreferrer"
        >
          Comprar agora pelo WhatsApp ↗
        </a>
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
      <p className="mt-7 text-xs leading-6 text-neutral-500">
        Parcelamento em até 12x. Consulte condições de pagamento.
      </p>
    </>
  );
}

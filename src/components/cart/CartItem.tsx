import { useCart } from "../../lib/cart/context";
import { SITE } from "../../lib/config";
import { type CartItem } from "../../lib/whatsapp";
export function CartItemRow({ item: p }: { item: CartItem }) {
  const { update } = useCart();
  return (
    <li className="grid grid-cols-[80px_1fr] items-center gap-5 py-6 sm:flex sm:flex-wrap">
      {p.image && (
        <img
          src={p.image}
          alt={p.name}
          className="h-20 w-20 object-cover sm:h-24 sm:w-28"
        />
      )}
      <div className="col-start-2 min-w-0 flex-1">
        <a className="font-bold" href={p.publicUrl.replace(SITE, "")}>
          {p.name}
        </a>
        {p.codigo && (
          <p className="mt-2 text-sm text-neutral-500">Código {p.codigo}</p>
        )}
        <button
          className="mt-3 text-sm underline"
          onClick={() => update(p.productId, 0)}
        >
          Remover
        </button>
      </div>
      <label className="col-span-2 justify-self-end text-sm">
        Quantidade
        <input
          aria-label={`Quantidade de ${p.name}`}
          className="ml-3 w-16 border p-2"
          type="number"
          min="1"
          max="99"
          value={p.quantity}
          onChange={(e) =>
            update(p.productId, Math.max(1, Number(e.target.value) || 1))
          }
        />
      </label>
    </li>
  );
}

import { useCart } from "../../lib/cart/context";
import { CartItemRow } from "./CartItem";
import { CartSummary } from "./CartSummary";
export function CartView() {
  const { items, ready } = useCart();
  if (!ready)
    return (
      <p role="status" className="py-12 text-neutral-500">
        Carregando seu carrinho…
      </p>
    );
  if (!items.length)
    return (
      <div className="border-y border-neutral-200 py-16">
        <h2 className="text-2xl font-bold">Seu próximo caminho começa aqui.</h2>
        <p className="mt-3 text-neutral-600">
          Seu carrinho está vazio. Explore o catálogo e escolha os produtos para
          sua picape.
        </p>
        <a className="btn mt-8" href="/produtos/">
          Explorar produtos ↗
        </a>
      </div>
    );
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
      <ul className="divide-y divide-neutral-200">
        {items.map((p) => (
          <CartItemRow key={p.productId} item={p} />
        ))}
      </ul>
      <CartSummary items={items} />
    </div>
  );
}

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Post } from "../lib/wordpress/types";
import { SITE } from "../lib/config";
import { cartMessage, whatsapp, type CartItem } from "../lib/whatsapp";
const CartContext = createContext<{
  items: CartItem[];
  add: (p: Post) => void;
  update: (id: number, quantity: number) => void;
  notice: string;
  ready: boolean;
}>({ items: [], add: () => {}, update: () => {}, notice: "", ready: false });
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem("jmb-cart-v1") || "[]",
      );
      if (Array.isArray(stored))
        setItems(
          stored.filter(
            (p): p is CartItem =>
              p &&
              Number.isInteger(p.productId) &&
              typeof p.name === "string" &&
              typeof p.publicUrl === "string" &&
              p.publicUrl.startsWith(`${SITE}/`) &&
              Number.isInteger(p.quantity) &&
              p.quantity > 0 &&
              p.quantity <= 99,
          ),
        );
    } catch {
      /* Storage unavailable: cart remains usable in memory. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("jmb-cart-v1", JSON.stringify(items));
      } catch {
        /* Memory fallback. */
      }
    }
  }, [items, ready]);
  const add = (p: Post) => {
    setItems((old) =>
      old.some((i) => i.productId === p.id)
        ? old.map((i) =>
            i.productId === p.id
              ? { ...i, quantity: Math.min(99, i.quantity + 1) }
              : i,
          )
        : [
            ...old,
            {
              productId: p.id,
              slug: p.slug,
              name: p.name,
              codigo: p.acf?.codigo_produto,
              image: p.images[0]?.url,
              quantity: 1,
              publicUrl: `${SITE}${p.url}`,
            },
          ],
    );
    setNotice(`${p.name} adicionado ao carrinho.`);
  };
  const update = (id: number, quantity: number) =>
    setItems((old) =>
      old
        .map((i) =>
          i.productId === id
            ? {
                ...i,
                quantity: Math.max(0, Math.min(99, Math.trunc(quantity) || 0)),
              }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  return (
    <CartContext.Provider value={{ items, add, update, notice, ready }}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {notice}
      </div>
    </CartContext.Provider>
  );
}
export const useCart = () => useContext(CartContext);
export function CartView() {
  const { items, update, ready } = useCart();
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
          <li
            key={p.productId}
            className="grid grid-cols-[80px_1fr] items-center gap-5 py-6 sm:flex sm:flex-wrap"
          >
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
                <p className="mt-2 text-sm text-neutral-500">
                  Código {p.codigo}
                </p>
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
        ))}
      </ul>
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
    </div>
  );
}

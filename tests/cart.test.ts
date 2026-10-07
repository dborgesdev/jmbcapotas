import { describe, expect, it } from "vitest";
import {
  addProduct,
  readStoredItems,
  updateQuantity,
} from "../src/lib/cart/state";
import type { Post } from "../src/lib/wordpress/types";

const product: Post = {
  id: 42,
  slug: "teste",
  name: "Teste",
  html: "",
  summary: "",
  images: [],
  featured_media: 0,
  date: "2026-10-07",
  modified: "2026-10-07",
  url: "/produtos/teste/",
  acf: { codigo_produto: "TEST" },
};

describe("Carrinho local", () => {
  it("adiciona, reúne unidades e limita a quantidade sem alterar o estado anterior", () => {
    const initial = addProduct([], product);
    const next = addProduct(initial, product);
    expect(initial[0].quantity).toBe(1);
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({
      quantity: 2,
      codigo: "TEST",
      publicUrl: "https://jmbcapotas.com.br/produtos/teste/",
    });
    expect(
      addProduct([{ ...next[0], quantity: 99 }], product)[0].quantity,
    ).toBe(99);
  });
  it("atualiza quantidades e remove itens zerados", () => {
    const items = addProduct([], product);
    expect(updateQuantity(items, 42, 3.9)[0].quantity).toBe(3);
    expect(updateQuantity(items, 42, 100)[0].quantity).toBe(99);
    expect(updateQuantity(items, 42, 0)).toEqual([]);
    expect(updateQuantity(items, 42, Number.NaN)).toEqual([]);
  });
  it("hidrata apenas itens válidos e preserva a origem das URLs", () => {
    const valid = addProduct([], product)[0];
    expect(
      readStoredItems(
        JSON.stringify([
          valid,
          null,
          { ...valid, quantity: 0 },
          { ...valid, quantity: 100 },
          { ...valid, publicUrl: "https://other.test/" },
        ]),
      ),
    ).toEqual([valid]);
    expect(readStoredItems(null)).toEqual([]);
    expect(() => readStoredItems("malformed")).toThrow(); // Provider captura e mantém o fallback em memória.
  });
});

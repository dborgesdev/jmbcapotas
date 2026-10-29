import { afterEach, expect, it, vi } from "vitest";
import { selectRelatedProducts } from "../src/lib/wordpress/related";
import type { Post } from "../src/lib/wordpress/types";
const p = (id: number, marca = [1], modelo = [2]) =>
  ({ id, marca, modelo }) as Post;
const mocks = vi.hoisted(() => ({ collection: vi.fn() }));
vi.mock("../src/lib/wordpress/query", () => ({ collection: mocks.collection }));
afterEach(() => vi.resetAllMocks());
it("requires both intersections even with multiple taxonomy terms, retaining order and at most four", () => {
  const current = p(1, [1, 3], [2, 4]);
  const candidates = [
    current,
    p(2, [1], [9]),
    p(3, [9], [2]),
    p(4, [], []),
    p(5, [3], [4]),
    p(5, [1], [2]),
    p(6),
    p(7),
    p(8),
    p(9),
  ];
  expect(selectRelatedProducts(current, candidates).map((p) => p.id)).toEqual([
    5, 6, 7, 8,
  ]);
  expect(selectRelatedProducts(current, [p(2), p(3)]).map((p) => p.id)).toEqual(
    [2, 3],
  );
  expect(selectRelatedProducts(current, candidates, 0)).toEqual([]);
});
it.each([
  [[], [2]],
  [[1], []],
  [[], []],
])(
  "does not query related products without both taxonomies",
  async (marca, modelo) => {
    const { relatedProducts } = await import("../src/lib/wordpress/products");
    expect(await relatedProducts(p(1, marca, modelo), [])).toEqual([]);
    expect(mocks.collection).not.toHaveBeenCalled();
  },
);
it("uses exactly one limited AND query and never fills missing results", async () => {
  const { relatedProducts } = await import("../src/lib/wordpress/products");
  mocks.collection.mockResolvedValue({
    items: [p(2), p(2), p(3, [9], [2]), p(1)],
  });
  expect(
    (await relatedProducts(p(1, [1, 3], [2, 4]), [])).map((p) => p.id),
  ).toEqual([2]);
  expect(mocks.collection).toHaveBeenCalledTimes(1);
  expect(mocks.collection.mock.calls[0][2]).toEqual({
    marca: "1,3",
    modelo: "2,4",
    tax_relation: "AND",
    exclude: 1,
    per_page: 4,
  });
});
it("returns empty on zero matches or temporary REST failure without another query", async () => {
  const { relatedProducts } = await import("../src/lib/wordpress/products");
  mocks.collection
    .mockResolvedValueOnce({ items: [] })
    .mockRejectedValueOnce(new Error("CMS"));
  expect(await relatedProducts(p(1), [])).toEqual([]);
  expect(await relatedProducts(p(1), [])).toEqual([]);
  expect(mocks.collection).toHaveBeenCalledTimes(2);
});

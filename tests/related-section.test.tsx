import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RelatedProducts } from "../src/components/products/RelatedProducts";
it("omits the related section when no compatible products exist", () => {
  expect(renderToStaticMarkup(<RelatedProducts products={[]} />)).toBe("");
  expect(renderToStaticMarkup(<RelatedProducts />)).toBe("");
});

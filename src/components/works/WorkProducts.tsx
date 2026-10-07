import { ProductGrid } from "../products/ProductGrid";
import { type Post } from "../../lib/wordpress/types";
export function WorkProducts({ products }: { products?: Post[] }) {
  return (
    <>
      {!!products?.length && (
        <section className="mt-14">
          <h2 className="mb-8 text-2xl font-bold">Produtos deste trabalho</h2>
          <ProductGrid posts={products} />
        </section>
      )}
    </>
  );
}

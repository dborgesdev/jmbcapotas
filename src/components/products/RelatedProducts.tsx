import { ProductGrid } from "./ProductGrid";
import { type Post } from "../../lib/wordpress/types";
export function RelatedProducts({ products }: { products?: Post[] }) {
  return (
    <>
      {!!products?.length && (
        <section className="border-t border-neutral-200 pt-12">
          <h2 className="section-title mb-10">Outras possibilidades</h2>
          <ProductGrid posts={products} />
        </section>
      )}
    </>
  );
}

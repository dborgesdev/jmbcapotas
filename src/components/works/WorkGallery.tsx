import { ProductGallery } from "../products/ProductGallery";
import { type Post } from "../../lib/wordpress/types";
export function WorkGallery({ post }: { post: Post }) {
  return (
    <div className="my-8 max-w-4xl">
      <ProductGallery post={post} />
    </div>
  );
}

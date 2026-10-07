import { type Post } from "../../lib/wordpress/types";
import { PostGrid } from "../blog/PostGrid";
export function BlogSection({ posts }: { posts?: Post[] }) {
  return posts?.length ? (
    <section className="wrap py-20">
      <div className="mb-12 flex flex-wrap justify-between gap-6">
        <h2 className="section-title">Na estrada com a JMB</h2>
        <a href="/blog/" className="font-bold">
          Explore o blog ↗
        </a>
      </div>
      <PostGrid posts={posts} />
    </section>
  ) : null;
}

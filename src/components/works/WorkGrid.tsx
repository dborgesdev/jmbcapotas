import { type Post } from "../../lib/wordpress/types";
import { WorkCard } from "./WorkCard";
export function WorkGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((p) => (
        <WorkCard key={p.id} post={p} />
      ))}
    </div>
  );
}

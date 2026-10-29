import { clean, safeHtml } from "./html";
import type { RawPost } from "./types";

type Editorial = {
  name: string;
  html: string;
  summary: string;
  introduction: string;
};
// Keys are the raw response objects already held by the 60s transport cache.
// This cache cannot keep those objects alive or reuse content from a new response.
const editorial = new WeakMap<
  RawPost,
  { title: string; content: string; value: Editorial }
>();
export function postContent(post: RawPost): Editorial {
  const title = post.title.rendered;
  const content = post.content.rendered;
  const cached = editorial.get(post);
  if (cached && cached.title === title && cached.content === content)
    return cached.value;
  const summary = clean(content).slice(0, 170);
  const value = {
    name: clean(title),
    html: safeHtml(content),
    summary,
    introduction:
      (content.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || [])
        .map(clean)
        .find((text) => text.length >= 40)
        ?.match(/^.*?[.!?](?:\s|$)|^.{1,240}(?:\s|$)/)?.[0]
        ?.trim() || summary,
  };
  editorial.set(post, { title, content, value });
  return value;
}

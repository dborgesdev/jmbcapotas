import type { MouseEvent } from "react";
export function homeNavigation(event: MouseEvent<HTMLAnchorElement>) {
  if (
    event.button ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  if (
    window.location.pathname === "/" &&
    event.currentTarget.getAttribute("href") === "/"
  ) {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
}

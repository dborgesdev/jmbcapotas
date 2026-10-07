import { eyebrowText } from "../../lib/text";
export function Eyebrow({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return <p className={`eyebrow ${className}`}>{eyebrowText(children)}</p>;
}

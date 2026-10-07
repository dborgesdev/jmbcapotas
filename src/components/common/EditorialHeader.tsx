import { headingText } from "../../lib/text";
import { Eyebrow } from "./Eyebrow";
export function EditorialHeader({
  title,
  eyebrow,
  date,
  introduction,
}: {
  title: string;
  eyebrow: string;
  date?: string;
  introduction?: string;
}) {
  return (
    <header className="max-w-4xl py-8">
      <Eyebrow className="text-red-600">{eyebrow}</Eyebrow>
      <h1 className="section-title mt-5">{headingText(title)}</h1>
      {introduction && (
        <p className="mt-6 text-base leading-7 text-neutral-600">
          {introduction}
        </p>
      )}
      {date && (
        <time className="mt-6 block text-sm text-neutral-500" dateTime={date}>
          {new Date(date).toLocaleDateString("pt-BR")}
        </time>
      )}
    </header>
  );
}

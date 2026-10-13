import { useEffect, useId, useRef, useState } from "react";
export function NavigationDropdown({
  label,
  items,
  mobile = false,
  onSelect,
}: {
  label: string;
  items: { name: string; url: string; depth?: number; divider?: boolean }[];
  mobile?: boolean;
  onSelect?: () => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div
      ref={ref}
      className={mobile ? "border-b border-white/10" : "relative"}
      onPointerEnter={(event) => {
        if (
          !mobile &&
          event.pointerType === "mouse" &&
          window.matchMedia("(hover: hover) and (pointer: fine)").matches
        )
          setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (!mobile && event.pointerType === "mouse") setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className={
          mobile
            ? "w-full py-4 text-left"
            : "py-2 hover:underline underline-offset-4"
        }
      >
        {label} <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div
          id={id}
          className={
            mobile
              ? "pb-4 pl-4"
              : "absolute left-0 top-full max-h-[70dvh] overflow-y-auto w-64 bg-[#151719] p-3 shadow-lg"
          }
        >
          {items.map((item) => (
            <a
              key={item.url}
              href={item.url}
              className={`block px-3 py-3 hover:bg-white/10 focus-visible:bg-white/10 ${item.divider ? "border-t border-white/20" : ""}`}
              style={{
                paddingLeft: `${0.75 + Math.min(item.depth || 0, 3) * 0.75}rem`,
              }}
              onClick={() => {
                setOpen(false);
                onSelect?.();
              }}
            >
              {item.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

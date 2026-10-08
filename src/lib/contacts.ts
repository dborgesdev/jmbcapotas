export function brazilianPhone(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return;
  let digits = String(value).replace(/\D/g, "");
  if (digits.startsWith("0055")) digits = digits.slice(2);
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55"))
    digits = digits.slice(2);
  if (!/^[1-9]\d{9,10}$/.test(digits)) return;
  return `55${digits}`;
}
export function phoneLabel(value: unknown): string | undefined {
  const phone = brazilianPhone(value)?.slice(2);
  if (!phone) return;
  return `(${phone.slice(0, 2)}) ${phone.slice(2, -4)}-${phone.slice(-4)}`;
}
export function telephoneLink(value: unknown) {
  const phone = brazilianPhone(value);
  return phone ? `tel:+${phone}` : undefined;
}

export function paymentConditions(
  installments: unknown,
  interestFree: unknown,
): string | undefined {
  if (
    typeof installments !== "number" ||
    !Number.isInteger(installments) ||
    installments < 2
  )
    return;
  return interestFree === true
    ? `Parcelamento em até ${installments}x sem juros`
    : `Parcelamento em até ${installments}x. Consulte condições de pagamento.`;
}

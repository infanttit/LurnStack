export function parseINRPriceToPaise(price) {
  if (!price) return 0;
  const normalized = String(price).replace(/,/g, "");
  const match = normalized.match(/(\d+)(?:\.(\d{1,2}))?/);
  if (!match) return 0;
  const rupees = Number(match[1] || 0);
  const paise = Number((match[2] || "0").padEnd(2, "0"));
  return rupees * 100 + paise;
}

export function formatINRFromPaise(paise) {
  const amount = Number.isFinite(paise) ? paise / 100 : 0;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
}

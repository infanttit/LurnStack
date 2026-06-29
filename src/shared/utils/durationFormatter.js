/**
 * Formats a decimal hour float into a human-friendly duration string.
 * E.g., 40.5 -> "40 hrs 30 mins", 0.0833 -> "5 mins", 1 -> "1 hr".
 * 
 * @param {number|string} decimalHours 
 * @returns {string}
 */
export function formatDecimalHours(decimalHours) {
  const hoursVal = Number(decimalHours);
  if (isNaN(hoursVal) || hoursVal <= 0) return "";

  // Convert decimal hours into total minutes, rounded to the nearest minute
  const totalMinutes = Math.round(hoursVal * 60);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hr" : "hrs"}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "min" : "mins"}`);
  }

  return parts.join(" ") || "0 mins";
}

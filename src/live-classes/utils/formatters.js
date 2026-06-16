export function formatIST(iso) {
  const date = new Date(iso || "");
  if (Number.isNaN(date.getTime())) return "Schedule pending";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso) {
  const date = new Date(iso || "");
  if (Number.isNaN(date.getTime())) return "Date pending";
  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso) {
  const date = new Date(iso || "");
  if (Number.isNaN(date.getTime())) return "Time pending";
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDurationLabel(minutes) {
  const value = Number(minutes || 0);
  if (!Number.isFinite(value) || value <= 0) return "Duration pending";
  if (value < 60) return `${Math.round(value)} min`;
  const hours = Math.floor(value / 60);
  const rest = Math.round(value % 60);
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

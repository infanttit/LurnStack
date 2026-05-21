export function toMs(iso) {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const pad2 = (n) => String(n).padStart(2, "0");
  if (days > 0) {
    return `${pad2(days)} Days : ${pad2(hours)} Hours : ${pad2(minutes)} Minutes : ${pad2(seconds)} Seconds`;
  }
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

export function parseTimeTo24h(time) {
  const raw = String(time || "").trim().toUpperCase();
  const match = raw.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(AM|PM)?$/);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] || "0");
  const meridiem = match[3] || "";

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (minutes < 0 || minutes > 59) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === "AM" && hours === 12) hours = 0;
    if (meridiem === "PM" && hours !== 12) hours += 12;
  } else if (hours < 0 || hours > 23) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export function toKolkataIso(date, time) {
  const d = String(date || "").trim();
  if (d.includes("T")) return d;
  const t24 = parseTimeTo24h(time);
  if (!d || !t24) return "";
  return `${d}T${t24}+05:30`;
}

export function getDurationMinutes(startTime, endTime) {
  const start = parseTimeTo24h(startTime);
  const end = parseTimeTo24h(endTime);
  if (!start || !end) return 0;

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  return endTotal > startTotal ? endTotal - startTotal : 0;
}

export function getLiveTiming(scheduledAtIso, durationMinutes = 60, endsAtIso = "") {
  const startMs = toMs(scheduledAtIso);
  const explicitEndMs = toMs(endsAtIso);
  const durationEndMs = startMs + Number(durationMinutes || 0) * 60 * 1000;
  const endMs = explicitEndMs > startMs ? explicitEndMs : durationEndMs;
  return { startMs, endMs };
}


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

export function getLiveTiming(scheduledAtIso, durationMinutes = 60) {
  const startMs = toMs(scheduledAtIso);
  const endMs = startMs + Number(durationMinutes || 0) * 60 * 1000;
  return { startMs, endMs };
}


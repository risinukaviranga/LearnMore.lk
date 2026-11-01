const TZ = "Asia/Colombo";

export const formatLKR = (n: number) => `Rs. ${n.toLocaleString("en-LK")}`;

export const formatDateTime = (d: Date) =>
  d.toLocaleString("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/** "2026-11-05T18:00" (typed in Sri Lanka time) -> Date */
export function parseColombo(v: string): Date {
  return new Date(v.length === 16 ? `${v}:00+05:30` : v);
}

/** Date -> value for <input type="datetime-local"> in Sri Lanka time */
export function toColomboInput(d: Date): string {
  return new Date(d.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 16);
}

export function classStatus(startsAt: Date, durationMin: number) {
  const now = Date.now();
  const start = startsAt.getTime();
  const end = start + durationMin * 60000;
  if (now < start) return "UPCOMING" as const;
  if (now <= end) return "LIVE" as const;
  return "ENDED" as const;
}

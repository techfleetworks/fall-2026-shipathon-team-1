export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Human "time ago" from an ISO string. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(1, Math.round((Date.now() - then) / 1000));
  const mins = Math.round(secs / 60);
  const hrs = Math.round(mins / 60);
  const days = Math.round(hrs / 24);
  if (secs < 60) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

/** "Posted 1 hr ago" style helper. */
export function postedAgo(iso: string): string {
  return `Posted ${timeAgo(iso)}`;
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export const CATEGORY_LABEL: Record<string, string> = {
  clothing: "Clothing",
  shoes: "Shoes",
  toys: "Toys",
};

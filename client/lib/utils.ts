export function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

export function cropString(str: string | null | undefined, max = 20): string {
  if (!str) return "";
  const m = Math.max(0, Math.floor(max));
  if (str.length <= m) return str;
  if (m <= 3) return str.slice(0, m);
  return str.slice(0, m - 3) + "...";
}

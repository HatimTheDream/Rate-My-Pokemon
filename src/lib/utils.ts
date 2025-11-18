const C_PRIOR = 25;
const GLOBAL_MEAN = 5.5;

export function bayes(avg: number, n: number) {
  return (C_PRIOR * GLOBAL_MEAN + n * avg) / (C_PRIOR + n);
}

export function cls(...xs: (string | false | undefined)[]): string {
  return xs.filter(Boolean).join(" ");
}

export function loadJSON<T>(k: string, fallback: T): T {
  try {
    const s = localStorage.getItem(k);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(k: string, v: T) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

export function saveScroll() {
  try {
    sessionStorage.setItem("gridScrollY", String(window.scrollY || 0));
  } catch {}
}

export function restoreScroll() {
  try {
    const y = Number(sessionStorage.getItem("gridScrollY") || 0);
    requestAnimationFrame(() => window.scrollTo(0, y));
  } catch {}
}

export function goto(path: string) {
  window.location.hash = path;
}

export function formatName(raw: string): string {
  // Normalize separators
  let s = raw.replace(/-/g, ' ');

  // Regional variants: keep in name with capital
  s = s.replace(/\b(galar|hisui|alola)\b/i, (_, r: string) => `${r[0].toUpperCase()}${r.slice(1).toLowerCase()}`);

  // Mega variants: clean names - "Charizard X" instead of "Charizard (Mega X)"
  if (/\bmega x\b/i.test(s)) {
    s = s.replace(/\bmega x\b/i, 'X').trim().replace(/\s{2,}/g, ' ');
  } else if (/\bmega y\b/i.test(s)) {
    s = s.replace(/\bmega y\b/i, 'Y').trim().replace(/\s{2,}/g, ' ');
  } else if (/\bmega\b/i.test(s)) {
    s = s.replace(/\bmega\b/i, '').trim().replace(/\s{2,}/g, ' ');
  }

  // Special case fixes for specific Pokémon names
  s = s.replace(/\bho oh\b/i, 'Ho-Oh');
  s = s.replace(/\bmr mime\b/i, 'Mr. Mime');

  // Title case conversion
  const titled = s.replace(/\b\w/g, (c) => c.toUpperCase());
  
  return titled;
}

export function getVariantLabel(raw: string): string | null {
  // Extract variant label for display separately (Mega, X, Y, etc.)
  const lower = raw.toLowerCase();
  if (lower.includes('mega x')) return 'Mega X';
  if (lower.includes('mega y')) return 'Mega Y';
  if (lower.includes('mega')) return 'Mega';
  return null;
}

export function rangeFilter(data: { t: number; y: number }[], range: string) {
  if (!data.length) return data;
  const now = Date.now();
  const day = 24 * 3600 * 1000;
  const cutoff =
    range === "1d"
      ? now - day
      : range === "1w"
        ? now - 7 * day
        : range === "1m"
          ? now - 30 * day
          : range === "3m"
            ? now - 90 * day
            : 0;
  return cutoff ? data.filter((d) => d.t >= cutoff) : data;
}

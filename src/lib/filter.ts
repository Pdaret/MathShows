// Pure filter logic for /explore/. No DOM: the page script and tests share it.
export interface Item { subjects: string[]; formats: string[]; level: string; text: string }
export interface Sel { subjects: string[]; formats: string[]; levels: string[]; q: string }

export const emptySel = (): Sel => ({ subjects: [], formats: [], levels: [], q: "" });

/** AND between groups, OR inside a group; empty group = no constraint. */
export function matches(it: Item, s: Sel): boolean {
  const any = (want: string[], have: string[]) => !want.length || want.some(w => have.includes(w));
  const q = s.q.trim().toLowerCase();
  return any(s.subjects, it.subjects) && any(s.formats, it.formats) && any(s.levels, [it.level])
    && (!q || it.text.toLowerCase().includes(q));
}

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export function parseSel(search: string): Sel {
  const p = new URLSearchParams(search);
  return { subjects: list(p.get("subject")), formats: list(p.get("format")), levels: list(p.get("level")), q: p.get("q") ?? "" };
}

export function serializeSel(s: Sel): string {
  const p = new URLSearchParams();
  if (s.subjects.length) p.set("subject", s.subjects.join(","));
  if (s.formats.length) p.set("format", s.formats.join(","));
  if (s.levels.length) p.set("level", s.levels.join(","));
  if (s.q.trim()) p.set("q", s.q.trim());
  const out = p.toString();
  return out ? "?" + out : "";
}

import { getCollection, type CollectionEntry } from "astro:content";

export type Article = CollectionEntry<"articles">;

export const SITE = {
  title: "MathShows",
  tagline: "ریاضیات با شکل و مثال",
  description: "مقاله‌های تصویری و تعاملی ریاضی و مهندسی به فارسی.",
} as const;

/** Published articles, newest first. Drafts show only in `astro dev`. */
export async function getArticles(): Promise<Article[]> {
  const all = await getCollection("articles", a => import.meta.env.DEV || !a.data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Prefix an internal path with the configured base ("/MathShows/"). */
export const url = (path = "") => import.meta.env.BASE_URL.replace(/\/$/, "") + "/" + path.replace(/^\//, "");

export const articleUrl = (a: Article) => url(`articles/${a.id}/`);
export const tagUrl = (tag: string) => url(`tags/${encodeURIComponent(tag)}/`);

export const faDate = (d: Date) =>
  d.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
export const faNum = (n: number) => n.toLocaleString("fa-IR");

/** Interactive demos = hydrated islands in the MDX body (`client:` directives). */
export const demoCount = (a: Article) => (a.body?.match(/\bclient:(?:visible|load|idle|only)/g) ?? []).length;

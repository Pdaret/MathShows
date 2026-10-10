import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { SUBJECT_KEYS, FORMAT_KEYS, LEVEL_KEYS } from "./lib/taxonomy";

// One folder per article: src/content/articles/<slug>/index.mdx (+ demos/ next to it).
// The folder name is the URL slug. Frontmatter is validated here at build time.
const articles = defineCollection({
  loader: glob({ pattern: "*/index.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** موضوع (حوزه)؛ مقدارها در src/lib/taxonomy.ts. */
    subjects: z.array(z.enum(SUBJECT_KEYS)).min(1),
    /** نوع تجربه؛ مقدارها در src/lib/taxonomy.ts. */
    formats: z.array(z.enum(FORMAT_KEYS)).min(1),
    level: z.enum(LEVEL_KEYS),
    /** «بعد از این مقاله می‌توانی…» ؛ ۱ تا ۴ جمله‌ی کوتاه. */
    outcomes: z.array(z.string().min(1)).min(1).max(4),
    /** Estimated reading time in minutes. */
    minutes: z.number().int().positive(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };

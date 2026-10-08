import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
    /** Estimated reading time in minutes. */
    minutes: z.number().int().positive(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };

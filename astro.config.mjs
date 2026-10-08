// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// GitHub Pages project site: https://pdaret.github.io/MathShows/
export default defineConfig({
  site: "https://pdaret.github.io",
  base: "/MathShows",
  trailingSlash: "always",
  integrations: [mdx(), preact(), sitemap()],
  markdown: {
    // LaTeX is rendered to HTML at build time: no math JS in the browser.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: "ignore" }]],
    }),
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
});

import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE, articleUrl, getArticles } from "../lib/site";

export async function GET(context: APIContext) {
  const articles = await getArticles();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    customData: "<language>fa-IR</language>",
    items: articles.map(a => ({
      title: a.data.title,
      description: a.data.summary,
      pubDate: a.data.date,
      categories: a.data.tags,
      link: articleUrl(a),
    })),
  });
}

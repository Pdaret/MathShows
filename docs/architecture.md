# معماری

## ابزارها و دلیل انتخاب

| لایه | ابزار | چرا |
|---|---|---|
| فریم‌ورک | Astro 7 (خروجی استاتیک) | پیش‌فرض صفر JS؛ فقط جزیره‌های تعاملی JS دارند |
| محتوا | MDX + Content Collections | مارک‌داون + کامپوننت؛ frontmatter با Zod اعتبارسنجی می‌شود |
| ریاضی | `remark-math` + `rehype-katex` | LaTeX موقع build به HTML تبدیل می‌شود؛ در مرورگر JS ریاضی نداریم. فونت‌ها از پکیج `katex` باندل می‌شوند (بدون CDN) |
| کد | Shiki (داخلی Astro) | رنگ‌آمیزی موقع build، تم دوگانه روشن/تیره |
| تعامل | Preact (`@astrojs/preact`) | ~۴KB؛ هر دمو با `client:visible` فقط وقتی دیده شود hydrate می‌شود |
| زبان | TypeScript (strict + `noUncheckedIndexedAccess`) | |
| استایل | CSS خالص با توکن (بدون فریم‌ورک CSS) | |
| تست | `node:test` (Node تایپ‌اسکریپت را مستقیم اجرا می‌کند) | بدون وابستگی اضافه |
| فید | `@astrojs/rss` و `@astrojs/sitemap` | |

## ساختار

```
astro.config.mjs            base=/MathShows، MDX، Preact، KaTeX، Shiki
src/
  content.config.ts         اسکیمای مقاله (title, summary, date, tags, minutes, subjects, formats, level, outcomes, draft, updated)
  components/Chips, LevelBadge   چیپ موضوع/نوع و نشان سطح (کارت و سربرگ)
  lib/taxonomy.ts           فهرست موضوع‌ها، نوع‌های تجربه و سطح‌ها
  content/articles/<slug>/
    index.mdx               متن مقاله
    demos/*.tsx | *.astro   دموهای مخصوص همین مقاله
  lib/                      منطق خالص و تست‌پذیر، بدون DOM
    site.ts                 SITE، getArticles، ساخت URL، تاریخ فارسی
    la.ts, membrane.ts      ریاضیات دامنه
    frames.ts               قرارداد الگوریتم گام‌به‌گام
  components/
    *.astro                 کامپوننت‌های استاتیک (Callout, Toc, ArticleCard, SvgDefs, ThemeToggle)
    interactive/            قطعات مشترک Preact: Stepper, CanvasPlot, Slider/Controls/Readout, hooks
  layouts/
    BaseLayout.astro        <html>، هدر، فوتر، متا، تم
    ArticleLayout.astro     سرتیتر مقاله + TOC + گرید متن
  pages/
    index.astro             لیست مقاله‌ها
    articles/[slug].astro   یک صفحه برای هر مقاله
    tags/index.astro, tags/[tag].astro
    rss.xml.ts, 404.astro
  styles/                   global.css ← tokens, base, layout, chrome, prose, interactive
tests/*.test.ts             اعداد مثال‌های حل‌شده‌ی مقاله‌ها
docs/                       همین مستندات
```

## قواعد

1. **منطق در `src/lib`، نمایش در کامپوننت.** هر عددی که در متن مقاله آمده باید از تابعی در `lib` بیاید و در `tests/` assert شود؛ پس متن و دمو نمی‌توانند ناسازگار شوند.
2. **دموی مخصوص یک مقاله کنار همان مقاله** (`content/articles/<slug>/demos/`). اگر دو مقاله لازمش داشتند، به `components/interactive/` منتقل شود.
3. **شکل بدون تعامل = `.astro`** (موقع build رندر می‌شود، صفر JS). مثال: `PixelGrid.astro`.
4. **همه‌ی URLهای داخلی از `url()` / `articleUrl()` / `tagUrl()`** در `lib/site.ts` بسازید تا `base` رعایت شود.
5. **پیش‌نویس:** `draft: true` در frontmatter؛ در `dev` دیده می‌شود، در build نه.

## جریان رندر یک مقاله

`pages/articles/[slug].astro` ← `getArticles()` ← `render(entry)` ← `<Content components={{ Callout }} />` داخل `ArticleLayout`.
`headings` خروجی render به `Toc` داده می‌شود (فقط سطح ۲).

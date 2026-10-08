# نوشتن مقاله

## ساخت مقاله‌ی جدید

1. پوشه بسازید: `src/content/articles/<slug>/index.mdx` (نام پوشه = آدرس صفحه، انگلیسی و با خط تیره).
2. frontmatter:

```yaml
---
title: "عنوان مقاله"
summary: "یک یا دو جمله؛ در کارت و RSS و متای صفحه استفاده می‌شود."
date: "2026-10-08"
tags: ["جبر خطی", "هوش مصنوعی"]
minutes: 15
draft: true        # اختیاری
---
```

فیلد اشتباه یا جاافتاده باعث خطای build می‌شود (اسکیمای `src/content.config.ts`). ثبت در جای دیگری لازم نیست؛ لیست، برچسب‌ها، RSS و sitemap خودکار به‌روز می‌شوند.

## مارک‌داون

- `## عنوان` بخش اصلی (در فهرست مطالب می‌آید)، `### عنوان` زیربخش.
- جدول‌ها GFM معمولی؛ روی موبایل داخل خودشان اسکرول می‌خورند.
- بلاک کد با زبان: ` ```ts ` و ...

## LaTeX

- درون‌خطی: `$E = mc^2$`
- نمایشی (خط جدا):

```
$$
\nabla^2 I = \frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2}
$$
```

- عددها و عبارت‌های علامت‌دار مثل `(200−10)` را داخل `$...$` بنویسید، نه در متن فارسی؛ وگرنه bidi ترتیبشان را به هم می‌ریزد.
- در MDX کاراکترهای `{` `}` `<` بیرون از ریاضی معنای JSX دارند؛ اگر در متن لازم شد `\{` بنویسید.

## کامپوننت‌های آماده

`Callout` بدون import در همه‌ی مقاله‌ها در دسترس است:

```mdx
<Callout type="example" title="مثال">

متن با **مارک‌داون** و $x^2$ — خط خالی بعد از تگ باز و قبل از تگ بسته لازم است.

</Callout>
```

`type`: `note` (پیش‌فرض)، `example`، `warn`.

### شکل

```mdx
<figure>
  <svg viewBox="0 0 320 250" width="320">…</svg>
  <figcaption>شکل ۱ — توضیح، می‌تواند $\LaTeX$ داشته باشد.</figcaption>
</figure>
```

- `figure` به‌طور خودکار پهن‌تر از ستون متن است (ستون `wide`). برای تمام‌عرض: `<figure class="full">`.
- در SVG از `style="stroke:var(--accent)"` استفاده کنید تا با تم تیره عوض شود.
- پیکان‌ها و الگوهای مشترک: `marker-end="url(#ah-1)"` (`ah-1..4`، `ah-m`)، `fill="url(#grid40)"`، `url(#mem-pores)`، `url(#pores)` (تعریف در `components/SvgDefs.astro`).
- در SVG برچسب لاتین داخل متن فارسی را بین `\u2066 … \u2069` بگذارید.

### دموی تعاملی

```mdx
import MyDemo from './demos/MyDemo';

<figure>
  <MyDemo client:visible />
  <figcaption>شکل ۳ (تعاملی) — …</figcaption>
</figure>
```

بدون `client:visible` کامپوننت فقط یک بار موقع build رندر می‌شود و تعاملی نیست. ساختن دمو: [interactive.md](interactive.md).

## پیش از push

```bash
npm test && npm run check && npm run build
```

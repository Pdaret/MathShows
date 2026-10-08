# سیستم طراحی

اصل: مینیمال، متن‌محور، بدون شکستگی در هیچ عرضی (۳۲۰px تا 4K).

## توکن‌ها (`src/styles/tokens.css`)

هر رنگ، اندازه و فاصله از توکن می‌آید؛ مقدار خام در CSS دیگر ننویسید.

| گروه | توکن‌ها |
|---|---|
| تایپ (سیال با `clamp`) | `--step--1` … `--step-3`، `--leading`، `--font`، `--mono` |
| فاصله (سیال) | `--space-2xs` … `--space-xl`، `--gutter` |
| layout | `--measure` (68ch)، `--wide` (960px)، `--page` (1200px)، `--radius` |
| رنگ | `--bg`، `--surface`، `--surface-2`، `--fg`، `--muted`، `--border`، `--accent` … `--accent-4`، `--focus` |

تم تیره: خودکار از سیستم، یا دستی با دکمه‌ی هدر (`data-theme` روی `<html>`، ذخیره در `localStorage`، قبل از اولین paint اعمال می‌شود).

## Layout

### گرید مقاله (`.article-grid` در `layout.css`)

```
| gutter |  wide  |   content (≤68ch)   |  wide  | gutter |
[full    [wide    [content       content]   wide]    full]
```

- فرزندها به‌طور پیش‌فرض در ستون `content`.
- `figure` و فرمول نمایشی در `wide`؛ کلاس `.wide` / `.full` برای بقیه.
- ستون‌ها با `minmax(0, …)` و `min()` تعریف شده‌اند، پس هیچ فرزندی نمی‌تواند صفحه را افقی اسکرول کند. محتوای پهن (فرمول، جدول، کد) داخل خودش اسکرول می‌خورد.

### فهرست مطالب

- ≥1280px: ستون کناری چسبان، بخش فعلی هایلایت می‌شود.
- کمتر: `<details>` جمع‌شده بالای مقاله.

### لیست‌ها

`.card-list`: `grid auto-fill minmax(min(100%, 22rem), 1fr)` — تعداد ستون خودکار، بدون breakpoint.

## ریسپانسیو

- تقریباً هیچ breakpoint ثابتی نداریم؛ تایپ و فاصله سیال‌اند. تنها breakpoint صفحه 1280px برای TOC است.
- داخل دموها: **container query** روی `figure` (`interactive.css`)؛ کنترل‌ها زیر ۴۲۰px عمودی می‌شوند.
- اهداف لمسی ≥ 36px (`min-block-size: 2.25rem`).

## RTL و دوزبانه

- فقط خواص منطقی (`margin-inline`، `padding-inline-start`، `inset-block-start`، `border-inline-start`). `left`/`right` ممنوع.
- جزیره‌های LTR: `.katex`، `code`، `pre`، `.ltr`، `.num`، `svg` — همه `unicode-bidi: isolate`.
- اعداد و readoutهای لاتین با `--mono` (IRANSans گلیف‌های U+22C5 و U+2212 را ندارد).

## دسترس‌پذیری

لینک «پرش به محتوا»، `:focus-visible`، `aria-live` روی readoutها، `aria-label` روی canvasها، `aria-pressed` روی دکمه‌های حالت، احترام به `prefers-reduced-motion`.

## فایل‌های CSS

| فایل | محتوا |
|---|---|
| `tokens.css` | فونت‌ها و متغیرها |
| `base.css` | reset، عناصر پایه، دکمه و فرم |
| `layout.css` | `.container`، `.article-grid`، `.page` |
| `chrome.css` | هدر، فوتر، TOC، کارت، برچسب، callout |
| `prose.css` | تایپوگرافی مقاله، ریاضی، کد، جدول، figure |
| `interactive.css` | کنترل‌ها، readout، panels، stepper |

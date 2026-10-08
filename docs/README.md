# MathShows — راهنمای توسعه

این پوشه توضیح می‌دهد کد چطور سازمان یافته و چطور گسترشش بدهید.

| فایل | موضوع |
|---|---|
| [architecture.md](architecture.md) | ابزارها، ساختار پوشه‌ها، جریان build |
| [writing-articles.md](writing-articles.md) | نوشتن مقاله: frontmatter، مارک‌داون، LaTeX، کامپوننت‌ها |
| [interactive.md](interactive.md) | ساختن دموی تعاملی و اجرای گام‌به‌گام الگوریتم (`Stepper`) |
| [design-system.md](design-system.md) | توکن‌ها، layout، قواعد ریسپانسیو و RTL |

## دستورها

```bash
npm install          # یک بار
npm run dev          # http://localhost:4321/MathShows/
npm test             # تست‌های عددی (node:test روی TypeScript)
npm run check        # بررسی نوع‌ها (astro check)
npm run build        # خروجی استاتیک در dist/
npm run preview      # سرو کردن dist/
```

نیازمندی: Node ≥ 22.12. آدرس محلی **حتماً با `/MathShows/`** است چون `base` برای GitHub Pages تنظیم شده.

## استقرار

با هر push روی `main`، workflow فایل `.github/workflows/deploy.yml` تست، type-check و build می‌کند و `dist/` را روی GitHub Pages می‌گذارد.
یک بار در تنظیمات مخزن: **Settings → Pages → Source = GitHub Actions**.

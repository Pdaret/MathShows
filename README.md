# MathShows

مقاله‌های تصویری ریاضیات (فارسی، RTL) — سایت استاتیک بدون مرحله‌ی build، روی GitHub Pages.

## ساختار

```
index.html                 صفحه‌ی اصلی؛ لیست مقاله‌ها را از articles.json می‌خواند
articles.json              رجیستری مقاله‌ها (slug, title, summary, tags, date)
assets/css/main.css        تم مشترک (فونت IRANSans محلی، fallback: Vazirmatn)
assets/js/article.js       مشترک همه‌ی مقاله‌ها: رندر فرمول (KaTeX) + فهرست مطالب
articles/<slug>/index.html متن مقاله + شکل‌های SVG
articles/<slug>/demos.js   دموهای تعاملی همان مقاله
```

## افزودن مقاله‌ی جدید

1. پوشه‌ی `articles/<slug>/` بسازید (از مقاله‌ی موجود کپی کنید).
2. یک ورودی به `articles.json` اضافه کنید.

## اجرای محلی

```
python -m http.server 8000
```

(به‌خاطر `fetch` صفحه‌ی اصلی، باز کردن مستقیم فایل کار نمی‌کند.)

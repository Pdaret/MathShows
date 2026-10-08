# دموهای تعاملی

دموها کامپوننت Preact (`.tsx`) هستند و با `client:visible` در MDX فقط وقتی به دید کاربر برسند بارگذاری می‌شوند.

## قطعات مشترک (`src/components/interactive/`)

| قطعه | کاربرد |
|---|---|
| `Stepper` | اجرای گام‌به‌گام هر الگوریتم: پخش/توقف، قدم قبل/بعد، اسلایدر قدم، سرعت |
| `CanvasPlot` | نمودار canvas با محور، grid، لگاریتمی، legend؛ با تم هماهنگ |
| `Slider`, `Controls`, `Readout` | کنترل‌ها با برچسب و نمایش مقدار؛ `Readout` برای screen reader اعلام می‌شود |
| `useCssVars` | خواندن رنگ‌های تم (و بازخوانی هنگام تغییر تم) برای canvas |
| `useAnimationWhileVisible` | حلقه‌ی انیمیشن که بیرون از صفحه متوقف می‌شود و `prefers-reduced-motion` را رعایت می‌کند |
| `useInterval`, `fa()` | تایمر امن، عدد فارسی |

## الگو ۱: ماشین‌حساب

state در `useState`، محاسبه از `src/lib`، نمایش در `Readout`. نمونه: `membranes-separation/demos/PoiseuilleCalc.tsx`.

```tsx
export default function MyCalc() {
  const [r, setR] = useState(10);
  const J = hpFlux(...);                 // تابع خالص از src/lib
  return (
    <div>
      <Controls><Slider label="شعاع" value={r} min={1} max={100} unit="nm" onInput={setR} /></Controls>
      <Readout>شار = {fa(J, 0)} LMH</Readout>
    </div>
  );
}
```

## الگو ۲: نمودار

```tsx
<CanvasPlot label="…" spec={c => ({
  xmin: 0, xmax: 80, ymin: 0, ymax: 50, xlabel: "…", ylabel: "…",
  series: [{ pts, color: c.accent }],
})} />
```

`c` رنگ‌های تم است (`c.accent`، `c["accent-2"]`، `c.muted`…). نمونه: `ReverseOsmosisDemo.tsx`.

## الگو ۳: اجرای الگوریتم با `Stepper`

الگوریتم را به‌صورت **generator** بنویسید که در هر قدم یک snapshot تغییرناپذیر `yield` کند. Stepper همه‌ی قدم‌ها را جمع می‌کند، پس رفتن به عقب هم کار می‌کند.

```tsx
import { Stepper } from "../../../../components/interactive/Stepper";

interface Frame { arr: number[]; i: number; j: number }

function* bubbleSort(input: number[]) {
  const a = [...input];
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j]! > a[j + 1]!) [a[j], a[j + 1]] = [a[j + 1]!, a[j]!];
      yield { arr: [...a], i, j };        // کپی، نه ارجاع
    }
}

export default function BubbleSortDemo() {
  const data = [5, 1, 4, 2, 8];
  return (
    <Stepper<Frame>
      algorithm={() => bubbleSort(data)}
      deps={[data]}                       // با تغییر ورودی دوباره اجرا می‌شود
      render={f => <svg>…</svg>}
      describe={f => `compare a[${f.j}] , a[${f.j + 1}]`}
    />
  );
}
```

- منطق الگوریتم را اگر قابل استفاده‌ی مجدد است در `src/lib` بگذارید و در `tests/` تست کنید.
- سقف پیش‌فرض ۱۰٬۰۰۰ قدم (`collectFrames` در `lib/frames.ts`).
- نمونه‌های واقعی: `ConvolutionStepper.tsx`، `MatMulDemo.tsx`.

## قواعد

- عرض canvas/SVG را با `width` بدهید؛ CSS آن را تا عرض figure کوچک می‌کند (`max-inline-size: 100%`). ابعاد داخلی را عوض نکنید.
- رنگ ثابت hex ننویسید؛ `var(--…)` در SVG و `useCssVars` در canvas.
- عدد/فرمول خروجی لاتین → `<Readout ltr>` (فونت mono، جهت LTR).
- figure یک size container است: برای چیدمان داخلی از `@container` استفاده کنید، نه media query.
- انیمیشن پیوسته فقط با `useAnimationWhileVisible`.

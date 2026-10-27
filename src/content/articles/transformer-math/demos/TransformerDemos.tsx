import { useState } from "preact/hooks";
import { Controls, Readout, Slider } from "../../../../components/interactive/controls";
import { attention, patchLayout } from "../../../../lib/transformer";

const X = [[1, 0], [0, 1], [1, 1]];
const V = [[2, 0], [0, 4], [2, 4]];

export function AttentionDemo({ maskControl = false }: { maskControl?: boolean }) {
  const [row, setRow] = useState(2);
  const [strength, setStrength] = useState(1);
  const [causal, setCausal] = useState(maskControl);
  const { scores, weights, output } = attention(X.map(q => q.map(x => x * strength)), X, V, causal);
  const selected = row - 1;
  return <div>
    <Controls>
      <Slider label="توکن پرسشگر (شمارهٔ سطر)" min={1} max={3} value={row} onInput={setRow} />
      {maskControl
        ? <label class="ctl"><input type="checkbox" checked={causal} onChange={e => setCausal(e.currentTarget.checked)} />ماسک علّی فعال</label>
        : <Slider label="ضریب بردارهای Q" min={0} max={3} step={0.25} value={strength} onInput={setStrength} />}
    </Controls>
    <svg viewBox="0 0 540 300" width="540" role="img" aria-label={`ماتریس وزن توجه؛ سطر ${row} انتخاب شده؛ ستون‌ها توکن‌های من، چای، می‌نوشم؛ ضربدر یعنی اتصال ممنوع`}>
      <g text-anchor="middle" font-size="15">
        <text x="270" y="25">ستون: توکنِ منبع اطلاعات</text>
        {["من", "چای", "می‌نوشم"].map((token, j) => <text key={token} x={205 + j * 110} y="62">{token}</text>)}
        {weights.map((values, i) => <g key={i}>
          <text x="83" y={110 + i * 62}>{["من", "چای", "می‌نوشم"][i]}</text>
          {values.map((w, j) => <g key={j}>
            <rect x={155 + j * 110} y={78 + i * 62} width="100" height="52" fill="var(--accent)" fill-opacity={w * 0.38} stroke={i === selected ? "var(--accent)" : "var(--border)"} stroke-width={i === selected ? 3 : 1} />
            <text x={205 + j * 110} y={110 + i * 62} class="math">{causal && j > i ? "×" : w.toFixed(3)}</text>
          </g>)}
        </g>)}
        <text x="270" y="286">هر سطر جمعش یک است؛ قاب پررنگ سطر انتخابی است.</text>
      </g>
    </svg>
    <Readout ltr>scores[{row}] = [{scores[selected]!.map(s => s === -Infinity ? "−∞" : s.toFixed(3)).join(", ")}]</Readout>
    <Readout ltr>A[{row}] = [{weights[selected]!.map(w => w.toFixed(3)).join(", ")}] ; z[{row}] = [{output[selected]!.map(x => x.toFixed(3)).join(", ")}]</Readout>
    <p class="readout">{maskControl
      ? "ماسک را بردارید: توکن دوم دوباره از توکن سوم اطلاعات می‌گیرد. ماسک پیش از softmax اعمال می‌شود؛ جمع وزن‌های مجاز همچنان یک است."
      : "ضریب صفر، وزن‌های برابر می‌سازد. ضریب بزرگ‌تر اختلاف امتیازها را بیشتر می‌کند؛ این ضریب یک آزمایش است، نه پارامتر اضافهٔ فرمول اصلی."} بردارها ساختگی‌اند؛ هیچ مدل زبانی اجرا نمی‌شود.</p>
  </div>;
}

export function PatchDemo() {
  const [patch, setPatch] = useState(16);
  const [index, setIndex] = useState(0);
  const layout = patchLayout(224, 224, patch);
  const col = index % layout.cols, row = Math.floor(index / layout.cols);
  return <div>
    <Controls>
      <label class="ctl"><span>اندازهٔ patch (پیکسل)</span><select value={patch} onChange={e => { setPatch(+e.currentTarget.value); setIndex(0); }}>
        {[8, 16, 32].map(p => <option key={p} value={p}>{p} × {p}</option>)}
      </select></label>
      <Slider label="شمارهٔ patch (از صفر)" min={0} max={layout.patches - 1} value={index} onInput={setIndex} />
    </Controls>
    <svg viewBox="0 0 560 300" width="560" role="img" aria-label={`تصویر فرضی ۲۲۴ در ۲۲۴؛ ${layout.patches} تکه؛ تکهٔ شمارهٔ ${index} انتخاب شده`}>
      <rect x="18" y="42" width="224" height="224" fill="var(--surface-2)" />
      <circle cx="192" cy="88" r="23" fill="var(--accent-4)" />
      <path d="M18 214L92 118L166 214L205 165L242 214V266H18Z" fill="var(--accent-3)" fill-opacity="0.5" />
      <g stroke="var(--fg)" stroke-opacity="0.35" stroke-width="0.8">
        {Array.from({ length: layout.cols + 1 }, (_, i) => <path key={i} d={`M${18 + i * patch} 42V266M18 ${42 + i * patch}H242`} />)}
      </g>
      <rect x={18 + col * patch} y={42 + row * patch} width={patch} height={patch} fill="var(--accent)" fill-opacity="0.25" stroke="var(--accent)" stroke-width="3" />
      <path d="M258 150H302" fill="none" stroke="var(--accent)" stroke-width="2" marker-end="url(#ah-1)" />
      <g text-anchor="middle" font-size="15">
        <text x="130" y="25">تصویر شماتیک RGB</text>
        <text x="420" y="68">بازکردن تکه به یک بردار</text>
        <text x="420" y="108" class="math">{patch} × {patch} × 3 = {layout.patchDim}</text>
        <text x="420" y="150">فرافکنی آموختنی به بُعد مدل</text>
        <text x="420" y="190">افزودن بردار موقعیت</text>
        <text x="420" y="230" class="math">patch #{index} → token #{index + 1}</text>
        <text x="280" y="291">ترتیب سطر به سطر؛ توکن صفر برای CLS است.</text>
      </g>
    </svg>
    <Readout>تعداد patch: <span class="num">{layout.patches}</span>؛ با توکن طبقه‌بندی: <span class="num">{layout.tokens}</span>؛ تعداد امتیازهای توجه در هر سر و هر لایه: <span class="num">{layout.scores.toLocaleString("en-US")}</span>.</Readout>
    <p class="readout">تکه‌بندی تصویر در دمو انجام می‌شود، ولی embedding و طبقه‌بندی محاسبه نمی‌شوند. patch کوچک‌تر توکن بیشتری می‌سازد؛ توجه کامل باید زوج‌های بیشتری را پردازش کند.</p>
  </div>;
}

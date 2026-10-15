import { useState } from "preact/hooks";
import { Controls, Readout, Slider } from "../../../../components/interactive/controls";
import { ntpExchange } from "../../../../lib/timekeeping";

export function BootDemo() {
  const [power, setPower] = useState(false);
  const [battery, setBattery] = useState(true);
  const [valid, setValid] = useState(true);
  const [network, setNetwork] = useState(false);
  const [hours, setHours] = useState(8);
  const rtcRuns = power || battery;
  const known = valid && rtcRuns;
  return <div>
    <Controls>
      <label class="ctl"><input type="checkbox" checked={power} onChange={e => setPower(e.currentTarget.checked)} />برق اصلی وصل</label>
      <label class="ctl"><input type="checkbox" checked={battery} onChange={e => setBattery(e.currentTarget.checked)} />باتری RTC سالم</label>
      <label class="ctl"><input type="checkbox" checked={valid} onChange={e => setValid(e.currentTarget.checked)} />RTC قبلاً تنظیم شده</label>
      <label class="ctl"><input type="checkbox" checked={network} onChange={e => setNetwork(e.currentTarget.checked)} />مرجع شبکه در دسترس</label>
      <Slider label="مدت خاموشی فرضی" min={0} max={24} value={hours} unit="ساعت" onInput={setHours} />
    </Controls>
    <svg viewBox="0 0 540 180" width="540" role="img" aria-label="مسیر تأمین زمان از ساعت سخت‌افزاری به سیستم‌عامل و مرجع شبکه">
      <g fill="none" stroke="var(--border)" stroke-width="2">
        <rect x="15" y="30" width="145" height="100" rx="8" />
        <rect x="200" y="30" width="140" height="100" rx="8" />
        <rect x="380" y="30" width="145" height="100" rx="8" />
        <path d="M160 80H195M380 80H345" marker-end="url(#ah-m)" />
      </g>
      <g text-anchor="middle" font-size="15">
        <text x="87" y="57">RTC</text>
        <text x="87" y="86" style={{ fill: rtcRuns ? "var(--accent-3)" : "var(--muted)" }}>{rtcRuns ? "دارای تغذیه" : "بدون تغذیه"}</text>
        <text x="87" y="113">{known ? `+${hours} h` : "زمان نامعتبر"}</text>
        <text x="270" y="57">سیستم‌عامل</text>
        <text x="270" y="91">{power ? "در حال اجرا" : "خاموش"}</text>
        <text x="452" y="57">مرجع شبکه</text>
        <text x="452" y="91">{network ? "در دسترس" : "قطع"}</text>
      </g>
    </svg>
    <Readout>{!power
      ? known ? "CPU خاموش است؛ RTC با تغذیهٔ پشتیبان فاصلهٔ خاموشی را می‌شمارد." : "خاموشی بدون زمان معتبر؛ این دستگاه تاریخ امروز را نمی‌داند."
      : network ? "پس از همگام‌سازی موفق، زمان از مرجع شبکه اصلاح می‌شود؛ صرف اتصال شبکه کافی نیست."
      : known ? "بوت آفلاین: سیستم‌عامل زمان اولیه را از RTC معتبر می‌گیرد؛ درست‌بودن کامل آن تضمین نیست."
      : "دستگاه روشن است، اما تاریخ معتبر ندارد؛ باید از مرجع بیرونی یا تنظیم دستی کمک بگیرد."}</Readout>
    <p class="readout">مدل سناریویی است، نه حافظهٔ واقعی قطع برق: گزینه‌ها را مستقل انتخاب کنید. اتصال دوبارهٔ برق، تاریخ ازدست‌رفته را برنمی‌گرداند.</p>
  </div>;
}

export function TickDemo() {
  const [ticks, setTicks] = useState(4);
  return <div>
    <svg viewBox="0 0 500 160" width="500" role="img" aria-label="چهار تیک در هر ثانیه؛ شمارنده زمان سپری‌شده را می‌دهد نه تاریخ را">
      <path d="M30 85H470" class="axis" />
      {Array.from({ length: 17 }, (_, i) => <g key={i}>
        <path d={`M${30 + i * 27.5} 65v40`} stroke={i <= ticks ? "var(--accent)" : "var(--border)"} stroke-width="2" />
        {i % 4 === 0 && <text x={30 + i * 27.5} y="132" text-anchor="middle">{i / 4} s</text>}
      </g>)}
      <circle cx={30 + ticks * 27.5} cy="85" r="7" fill="var(--accent-2)" />
      <text x="250" y="30" text-anchor="middle">مدل آموزشی: 4 تیک در ثانیه</text>
    </svg>
    <Controls><Slider label="شمارنده را جلو ببر" min={0} max={16} value={ticks} onInput={setTicks} /></Controls>
    <Readout>شمارنده: <span class="num">{ticks}</span>؛ مدت: <span class="num">{ticks / 4} s</span>. بدون نقطهٔ شروع تقویمی، ساعتِ روز هنوز نامعلوم است.</Readout>
  </div>;
}

export function ElapsedDemo() {
  const [seconds, setSeconds] = useState(5);
  const [jump, setJump] = useState(-120);
  return <div>
    <Controls>
      <Slider label="مدت واقعی آزمایش" min={1} max={30} value={seconds} unit="s" onInput={setSeconds} />
      <Slider label="تغییر ناگهانی ساعت تقویمی" min={-120} max={120} step={10} value={jump} unit="s" onInput={setJump} />
    </Controls>
    <svg viewBox="0 0 500 180" width="500" role="img" aria-label="مقایسه زمان سپری‌شده با تفاضل ساعت تقویمی پس از تغییر دستی ساعت">
      <g text-anchor="middle">
        <rect x="15" y="20" width="225" height="140" rx="8" fill="var(--surface-2)" />
        <rect x="260" y="20" width="225" height="140" rx="8" fill="var(--surface-2)" />
        <text x="127" y="55">CLOCK_REALTIME</text>
        <text x="372" y="55">CLOCK_MONOTONIC</text>
        <text x="127" y="105" class="math" style={{ fill: "var(--accent-2)" }}>{seconds + jump} s</text>
        <text x="372" y="105" class="math" style={{ fill: "var(--accent-3)" }}>{seconds} s</text>
        <text x="127" y="140">تفاضل دو خواندن ساعت</text>
        <text x="372" y="140">مدت سپری‌شده</text>
      </g>
    </svg>
    <Readout>کار {seconds} ثانیه طول کشید؛ تفاضل ساعت تقویمی {seconds + jump} ثانیه شد. ساعت یکنواخت از پرش دستی ساعت تقویمی اثر نمی‌گیرد. این آزمایش هیچ تنظیمی در ساعت دستگاه شما تغییر نمی‌دهد.</Readout>
  </div>;
}

export function NtpDemo() {
  const [offset, setOffset] = useState(100);
  const [outbound, setOutbound] = useState(40);
  const [inbound, setInbound] = useState(40);
  const t1 = 1000;
  const t2 = t1 + outbound + offset;
  const t3 = t2 + 10;
  const t4 = t1 + outbound + 10 + inbound;
  const result = ntpExchange(t1, t2, t3, t4);
  return <div>
    <Controls>
      <Slider label="جلو بودن واقعی سرور" min={-200} max={200} step={10} value={offset} unit="ms" onInput={setOffset} />
      <Slider label="تأخیر رفت" min={10} max={150} step={10} value={outbound} unit="ms" onInput={setOutbound} />
      <Slider label="تأخیر برگشت" min={10} max={150} step={10} value={inbound} unit="ms" onInput={setInbound} />
    </Controls>
    <svg viewBox="0 0 530 280" width="530" role="img" aria-label="چهار زمان NTP: ارسال و دریافت در کلاینت و دریافت و ارسال در سرور">
      <path d="M100 45V255M430 45V255" class="axis" />
      <g text-anchor="middle"><text x="100" y="25">کلاینت</text><text x="430" y="25">سرور</text></g>
      <path d="M100 80L425 130M430 170L105 230" fill="none" stroke="var(--accent)" stroke-width="2" marker-end="url(#ah-1)" />
      <g font-size="14" class="math">
        <text x="8" y="68">t1 = {t1}</text><text x="310" y="112">t2 = {t2}</text>
        <text x="310" y="192">t3 = {t3}</text><text x="8" y="254">t4 = {t4}</text>
      </g>
      <text x="265" y="153" text-anchor="middle" font-size="13">پردازش سرور: 10 ms</text>
    </svg>
    <Readout>اختلاف تخمینی سرور با کلاینت: <span class="num">{result.offset} ms</span>؛ تأخیر رفت‌وبرگشتِ شبکه: <span class="num">{result.delay} ms</span>؛ خطای تخمین: <span class="num">{result.offset - offset} ms</span>.</Readout>
    <p class="readout">ابتدا تأخیرها را برابر بگذارید؛ سپس فقط رفت را کم کنید. فاصله‌های شکل شماتیک‌اند، نه مقیاس واقعی زمان. هیچ درخواست شبکه‌ای فرستاده نمی‌شود.</p>
  </div>;
}

import { useRef, useState } from "preact/hooks";
import { fa, useAnimationWhileVisible, useCssVars } from "../../../../components/interactive/hooks";
import { Controls, Readout } from "../../../../components/interactive/controls";

const SPECIES = [
  { name: "باکتری", r: 8, color: "accent-2" },
  { name: "پروتئین", r: 4.5, color: "accent-4" },
  { name: "یون دوظرفیتی/قند", r: 3, color: "accent-3" },
  { name: "نمک NaCl", r: 2.3, color: "accent" },
  { name: "آب", r: 1.4, color: "muted" },
] as const;
type Mode = "MF" | "UF" | "NF" | "RO";
// Pass probability per collision with the membrane (order follows SPECIES)
const PASS: Record<Mode, number[]> = { MF: [0, 1, 1, 1, 1], UF: [0, 0, 1, 1, 1], NF: [0, 0, 0.08, 0.5, 1], RO: [0, 0, 0, 0.01, 1] };
const GAP: Record<Mode, number> = { MF: 18, UF: 8, NF: 4.5, RO: 2.5 };
const W = 640, H = 300, MX = W / 2;

interface P { s: number; x: number; y: number; vx: number; vy: number; decided: boolean; stuck: boolean }

/** Fig 4: particles hitting MF/UF/NF/RO membranes; live rejection per species. */
export default function SieveDemo() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("UF");
  const st = useRef({ parts: [] as P[], counts: SPECIES.map(() => ({ hit: 0, pass: 0 })), mode: "UF" as Mode });
  const [, tick] = useState(0);
  const c = useCssVars(["fg", "muted", "surface-2", "font", "accent", "accent-2", "accent-3", "accent-4"] as const);

  const pick = (m: Mode) => { st.current = { parts: [], counts: SPECIES.map(() => ({ hit: 0, pass: 0 })), mode: m }; setMode(m); };

  let frame = 0;
  useAnimationWhileVisible(cv, () => {
    const ctx = cv.current!.getContext("2d")!, S = st.current;
    for (let k = 0; k < 3 && S.parts.length < 260; k++) {
      const s = Math.random() < 0.45 ? 4 : Math.floor(Math.random() * 4);
      S.parts.push({ s, x: 10 + Math.random() * 60, y: 20 + Math.random() * (H - 40), vx: 0.6 + Math.random() * 0.8, vy: 0, decided: false, stuck: false });
    }
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c["surface-2"]; ctx.fillRect(MX, 0, W - MX, H);
    ctx.font = "13px " + c.font; ctx.fillStyle = c.muted; ctx.textAlign = "center";
    ctx.fillText("خوراک (Feed)", MX / 2, 16); ctx.fillText("تراوه (Permeate)", MX + (W - MX) / 2, 16);
    ctx.fillStyle = c.fg;
    for (let y = 26; y < H; y += 22) ctx.fillRect(MX - 4, y, 8, 22 - GAP[S.mode]);
    for (const p of S.parts) {
      const r = SPECIES[p.s]!.r;
      p.vy = (p.vy + (Math.random() - 0.5) * 0.5) * 0.9;
      p.x += p.vx; p.y += p.vy;
      if (p.y < 26 || p.y > H - 4) { p.vy *= -1; p.y = Math.min(Math.max(p.y, 26), H - 4); }
      if (!p.decided && p.x + r >= MX - 4) {
        p.decided = true; S.counts[p.s]!.hit++;
        if (Math.random() < PASS[S.mode][p.s]!) S.counts[p.s]!.pass++;
        else { p.x = MX - 4 - r; p.vx = 0; p.stuck = true; }
      }
      if (p.stuck) p.x = Math.min(p.x, MX - 4 - r) - Math.random() * 0.25;
    }
    // stuck particles pile up (cake); age them out so the scene never freezes
    S.parts = S.parts.filter(p => p.x < W + 10 && !(p.stuck && Math.random() < 0.006));
    for (const p of S.parts) {
      const sp = SPECIES[p.s]!;
      ctx.fillStyle = c[sp.color]; ctx.globalAlpha = sp.name === "آب" ? 0.55 : 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, sp.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (++frame % 15 === 0) tick(n => n + 1); // refresh readout ~4×/s, not every frame
  });

  return (
    <div>
      <canvas ref={cv} width={W} height={H} role="img" aria-label="شبیه‌سازی عبور ذرات از غشا" />
      <Controls>
        {(["MF", "UF", "NF", "RO"] as const).map(m =>
          <button type="button" class={m === mode ? "" : "secondary"} aria-pressed={m === mode} onClick={() => pick(m)}>{m}</button>)}
      </Controls>
      <Readout>
        {SPECIES.map((sp, i) => {
          const k = st.current.counts[i]!, R = k.hit ? 100 * (1 - k.pass / k.hit) : 0;
          return <span style={{ whiteSpace: "nowrap", color: `var(--${sp.color})`, marginInline: "0.5em" }}>● {sp.name}: پس‌زنی {fa(R, 0)}٪</span>;
        })}
      </Readout>
    </div>
  );
}

import { useMemo, useRef, useState } from "preact/hooks";
import { useAnimationWhileVisible } from "../../../../components/interactive/hooks";
import { Controls } from "../../../../components/interactive/controls";

interface Dot { x: number; y: number }
interface Scene { cross: boolean; h: number; dots: Dot[] }
const mkScene = (cross: boolean): Scene => ({
  cross, h: 0, dots: Array.from({ length: 18 }, () => ({ x: 10 + Math.random() * 200, y: 30 + Math.random() * 100 })),
});

function View({ s }: { s: Scene }) {
  const top = 150 - s.h, flux = 1 / (1 + s.h / 15); // J ∝ 1/(Rm + Rc), Rc ∝ cake height
  return (
    <svg viewBox="0 0 220 200" width={220}>
      <rect x={10} y={150} width={200} height={8} fill="url(#mem-pores)" />
      <rect x={10} y={top} width={200} height={s.h} style="fill:var(--accent-2)" fill-opacity={0.6} />
      {[40, 110, 180].map(x => <line x1={x} x2={x} y1={162} y2={192} stroke-width={3} style="stroke:var(--accent)" marker-end="url(#ah-1)" stroke-opacity={flux} />)}
      {s.cross
        ? <line x1={10} x2={205} y1={20} y2={20} stroke-width={3} style="stroke:var(--fg)" marker-end="url(#ah-m)" />
        : <line x1={110} x2={110} y1={5} y2={40} stroke-width={3} style="stroke:var(--fg)" marker-end="url(#ah-m)" />}
      {s.dots.map(d => <circle cx={d.x} cy={d.y} r={4} style="fill:var(--accent-2)" />)}
    </svg>
  );
}

/** Fig 2: dead-end vs cross-flow cake growth. */
export default function FlowModesDemo() {
  const root = useRef<HTMLDivElement>(null);
  const scenes = useMemo(() => [mkScene(false), mkScene(true)], []);
  const [, tick] = useState(0);
  useAnimationWhileVisible(root, dt => {
    for (const o of scenes) {
      const top = 150 - o.h;
      for (const d of o.dots) {
        d.y += 60 * dt; if (o.cross) d.x += 120 * dt;
        if (d.y >= top - 4) {
          if (o.cross) { if (o.h < 10) o.h += 0.4; } else o.h = Math.min(110, o.h + 1.2);
          d.y = 30; d.x = o.cross ? 10 : 10 + Math.random() * 200;
        }
        if (d.x > 210) { d.x = 10; d.y = 30 + Math.random() * 100; }
      }
    }
    tick(n => n + 1);
  });
  return (
    <div ref={root}>
      <div class="panels">
        <div><View s={scenes[0]!} />بن‌بست: کیک رشد می‌کند</div>
        <div><View s={scenes[1]!} />متقاطع: ذرات شسته می‌شوند</div>
      </div>
      <Controls>
        <button type="button" class="secondary" onClick={() => scenes.forEach(s => (s.h = 0))}>از اول</button>
      </Controls>
    </div>
  );
}

import { Stepper } from "../../../../components/interactive/Stepper";

const A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]];
const C = A.map(r => B[0]!.map((_, j) => r[0]! * B[0]![j]! + r[1]! * B[1]![j]!));
const CELL = 40;

interface Frame { i: number; j: number }
function* algorithm() {
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) yield { i, j } as Frame;
}

function Matrix({ M, x0, label, hl, show }: { M: number[][]; x0: number; label: string; hl: (i: number, j: number) => string | null; show?: (i: number, j: number) => boolean }) {
  return (
    <g>
      <text x={x0 + CELL} y={35} text-anchor="middle" font-weight="700">{label}</text>
      {M.map((r, i) => r.map((v, j) => (
        <g>
          <rect x={x0 + j * CELL} y={50 + i * CELL} width={CELL} height={CELL} style={`stroke:var(--border);fill:${hl(i, j) ?? "transparent"}`} fill-opacity={0.3} />
          <text x={x0 + j * CELL + CELL / 2} y={50 + i * CELL + 26} text-anchor="middle" font-size="16" opacity={show && !show(i, j) ? 0.15 : 1}>{v}</text>
        </g>
      )))}
    </g>
  );
}

/** Fig 5: each c_ij = row i of A · column j of B. */
export default function MatMulDemo() {
  return (
    <Stepper<Frame>
      algorithm={algorithm}
      speed={1400}
      render={({ i, j }) => (
        <svg viewBox="0 0 420 150" width={420}>
          <Matrix M={A} x0={20} label="A" hl={r => (r === i ? "var(--accent)" : null)} />
          <text x={125} y={106} text-anchor="middle" font-size="22">×</text>
          <Matrix M={B} x0={150} label="B" hl={(_, c) => (c === j ? "var(--accent-3)" : null)} />
          <text x={270} y={106} text-anchor="middle" font-size="22">=</text>
          <Matrix M={C} x0={300} label="C = AB" hl={(r, c) => (r === i && c === j ? "var(--accent-2)" : null)} show={(r, c) => r * 2 + c <= i * 2 + j} />
        </svg>
      )}
      describe={({ i, j }) => `c${i + 1}${j + 1} = ${A[i]![0]}·${B[0]![j]} + ${A[i]![1]}·${B[1]![j]} = ${C[i]![j]}`}
    />
  );
}

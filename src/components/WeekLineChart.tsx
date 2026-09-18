"use client";

export interface ChartSeries {
  id: string;
  color: string;
  points: { x: number; y: number }[];
}

export function WeekLineChart({
  labels,
  series,
  ySuffix = "",
  height = 180,
}: {
  labels: string[];
  series: ChartSeries[];
  ySuffix?: string;
  height?: number;
}) {
  const ys = series.flatMap((s) => s.points.map((p) => p.y));
  if (labels.length < 1 || ys.length < 1) {
    return <p className="text-sm text-mist">Not enough weeks yet.</p>;
  }
  const padL = 36;
  const padR = 8;
  const padT = 12;
  const padB = 28;
  const w = 320;
  const h = height;
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = max - min || 1;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const xAt = (i: number) => padL + (labels.length === 1 ? innerW / 2 : (i / (labels.length - 1)) * innerW);
  const yAt = (v: number) => padT + innerH - ((v - min) / span) * innerH;
  const ticks = [min, min + span / 2, max];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={w - padR} y1={yAt(t)} y2={yAt(t)} stroke="rgba(255,255,255,0.08)" />
          <text x={padL - 6} y={yAt(t) + 3} textAnchor="end" fill="#9aa89f" fontSize="8">
            {Math.round(t)}
            {ySuffix}
          </text>
        </g>
      ))}
      {series.map((s) => {
        const pts = s.points.map((p) => `${xAt(p.x)},${yAt(p.y)}`).join(" ");
        return (
          <g key={s.id}>
            {s.points.length > 1 && (
              <polyline fill="none" stroke={s.color} strokeWidth="2.2" points={pts} />
            )}
            {s.points.map((p) => (
              <circle key={`${s.id}-${p.x}`} cx={xAt(p.x)} cy={yAt(p.y)} r="3" fill={s.color} />
            ))}
          </g>
        );
      })}
      {labels.map((label, i) => (
        <text key={label + i} x={xAt(i)} y={h - 8} textAnchor="middle" fill="#9aa89f" fontSize="8">
          {label}
        </text>
      ))}
    </svg>
  );
}

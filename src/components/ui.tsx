import type { SessionType } from "@/lib/types";

export function typeLabel(type: SessionType): string {
  const map: Record<SessionType, string> = {
    strength: "Strength",
    easy_run: "Easy run",
    quality_run: "Quality run",
    long_run: "Long run",
    mobility: "Mobility",
    rest: "Rest",
  };
  return map[type];
}

export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  if (values.length < 2) return <div className={`h-10 ${className}`} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / span) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`h-10 w-full ${className}`}>
      <polyline fill="none" stroke="currentColor" strokeWidth="3" points={pts} />
    </svg>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-ink-800/80 p-4 shadow-glow ${className}`}>
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-[0.18em] text-mist">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-white/10 bg-ink-900 px-3 py-3 text-foam outline-none ring-volt/40 focus:ring-2";

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full bg-volt px-5 py-3 text-sm font-semibold text-ink-950 disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full border border-white/15 px-5 py-3 text-sm text-foam ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function SeverityDot({ severity }: { severity: "info" | "watch" | "priority" }) {
  const color =
    severity === "priority" ? "bg-orange-400" : severity === "watch" ? "bg-amber-300" : "bg-volt";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

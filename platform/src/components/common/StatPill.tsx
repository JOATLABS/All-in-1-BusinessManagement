interface StatPillProps {
  label: string;
  value: string;
  detail?: string;
}

export function StatPill({ label, value, detail }: StatPillProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/50 px-6 py-5 text-white shadow-[0_40px_120px_-80px_rgba(4,6,8,0.85)] transition hover:border-white/25 hover:bg-black/60">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at top, rgba(240, 183, 107, 0.22), transparent 55%), radial-gradient(circle at bottom right, rgba(102, 76, 43, 0.25), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-white/50">{label}</span>
          <span className="block text-2xl font-semibold">{value}</span>
        </div>
        {detail ? (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-white/70">
            {detail}
          </span>
        ) : null}
      </div>
    </div>
  );
}

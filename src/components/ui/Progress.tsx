export function Progress({
  value,
  max,
  className = '',
  tone = 'bg-emerald-400',
  height = 'h-3',
}: {
  value: number
  max: number
  className?: string
  tone?: string
  height?: string
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div
      className={`${height} w-full overflow-hidden rounded-full border-[3px] border-black bg-white ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={`h-full ${tone} transition-[width] duration-300`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

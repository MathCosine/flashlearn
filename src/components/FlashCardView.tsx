import type { FlashCard, FlashSet } from '../types'

export function FlashCardView({
  card,
  set,
  flipped,
  onFlip,
}: {
  card: FlashCard
  set: FlashSet | undefined
  flipped: boolean
  onFlip: () => void
}) {
  return (
    <div
      className={`flip-card mx-auto h-72 w-full max-w-md cursor-pointer select-none ${
        flipped ? 'flipped' : ''
      }`}
      onClick={onFlip}
      role="button"
      aria-label="Flip card"
    >
      <div className="flip-card-inner relative h-full w-full">
        <div className="flip-card-face absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-[3px] border-black bg-amber-200 p-6 text-center shadow-[6px_6px_0_0_#000]">
          <p className="text-3xl font-extrabold text-slate-900">
            {card.front}
          </p>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-700">
            Tap to flip
          </p>
        </div>
        <div className="flip-card-face flip-card-back absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-[3px] border-black bg-sky-200 p-6 text-center shadow-[6px_6px_0_0_#000]">
          <p className="text-2xl font-extrabold text-slate-900">
            {card.back}
          </p>
          {set && set.extra_fields.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium text-slate-800">
              {set.extra_fields.map((f) =>
                card.extra_data[f.key] ? (
                  <span key={f.key}>
                    <span className="font-bold">{f.label}:</span>{' '}
                    {card.extra_data[f.key]}
                  </span>
                ) : null,
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import type { FlashSet, StudyItem } from '../types'
import { RichText } from './RichText'
import { CardImage } from './CardImage'

export function FlashCardView({
  item,
  set,
  flipped,
  onFlip,
  starred = false,
  onToggleStar,
  dots = 0,
}: {
  item: StudyItem
  set: FlashSet | undefined
  flipped: boolean
  onFlip: () => void
  starred?: boolean
  onToggleStar?: () => void
  dots?: number
}) {
  const { card, reversed } = item
  const showImage = Boolean(card.image_url)

  return (
    <div className="relative w-full max-w-xl">
      <div
        className={`flip-card h-80 w-full cursor-pointer select-none ${
          flipped ? 'flipped' : ''
        }`}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onFlip()
        }}
        aria-label="Flip card"
      >
        <div className="flip-card-inner relative h-full w-full">
          {/* Prompt side */}
          <div className="flip-card-face absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border-[3px] border-black bg-amber-200 p-6 text-center shadow-hard-lg">
            {showImage && !reversed && (
              <CardImage path={card.image_url!} className="max-h-28" />
            )}
            <p className="text-3xl font-bold text-ink">
              <RichText text={item.prompt} />
            </p>
            <p className="absolute bottom-4 text-xs font-bold uppercase tracking-widest text-stone-600">
              {reversed ? 'back → front' : 'tap or press space'}
            </p>
          </div>

          {/* Answer side */}
          <div className="flip-card-face flip-card-back absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-auto rounded-2xl border-[3px] border-black bg-sky-200 p-6 text-center shadow-hard-lg">
            {showImage && reversed && (
              <CardImage path={card.image_url!} className="max-h-24" />
            )}
            <p className="text-2xl font-bold text-ink">
              <RichText text={item.answer} />
            </p>
            {set && set.extra_fields.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium text-stone-700">
                {set.extra_fields.map((f) =>
                  card.extra_data[f.key] ? (
                    <span key={f.key}>
                      <span className="font-bold">{f.label}:</span>{' '}
                      <RichText text={card.extra_data[f.key]} />
                    </span>
                  ) : null,
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2">
        {dots > 0 && (
          <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-xs font-bold text-rose-700">
            {'●'.repeat(Math.min(dots, 5))}
            {dots > 5 ? `+${dots - 5}` : ''}
          </span>
        )}
        {onToggleStar && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleStar()
            }}
            aria-label={starred ? 'Unstar card' : 'Star card'}
            className={`pointer-events-auto h-8 w-8 rounded-lg border-2 border-black text-sm font-bold shadow-hard-sm transition-transform hover:-translate-y-0.5 ${
              starred ? 'bg-amber-300' : 'bg-white'
            }`}
          >
            {starred ? '★' : '☆'}
          </button>
        )}
      </div>
    </div>
  )
}

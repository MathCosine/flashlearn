import { STUDY_MODES } from '../types'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { Badge } from '../components/ui/Badge'

const SUBJECTS = [
  {
    title: 'Any subject',
    body: 'Front and back on every card, plus your own labeled fields — gender and principal parts, dates, definitions, whatever the material needs.',
    tone: 'bg-amber-200',
  },
  {
    title: 'Math and science',
    body: 'Write LaTeX between dollar signs and it renders as real math on the card, so formulas look like formulas.',
    tone: 'bg-sky-200',
    sample: 'e^{i\\pi} + 1 = 0',
  },
  {
    title: 'Languages',
    body: 'Click-to-type macrons and accents, forgiving answer checking, and reverse mode to drill in both directions.',
    tone: 'bg-emerald-200',
  },
]

const STEPS = [
  {
    n: '1',
    title: 'Build a set',
    body: 'Type cards in, or paste a whole chapter at once — the importer reads spreadsheet, comma and dash formats.',
  },
  {
    n: '2',
    title: 'Pick how to drill',
    body: 'Nine modes, from the classic pile-sorting method to timed games. Mix several sets together for a real test.',
  },
  {
    n: '3',
    title: 'Track what sticks',
    body: 'Dots pile up on stubborn cards, stars flag the ones you pick, and your streak keeps you honest.',
  },
]

export function Landing() {
  return (
    <div className="flex flex-col gap-16 py-4">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Badge className="bg-amber-300 text-amber-950">
            Free · works on your phone
          </Badge>
          <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Flashcards that
            <br />
            actually make it
            <br />
            <span className="bg-emerald-300 px-2 [box-decoration-break:clone]">
              stick.
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-lg font-medium text-stone-600">
            Build sets for any class, then drill them nine different ways —
            including digital versions of the pile-sorting and dot-marking
            methods that actually work on paper.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button to="/signup" variant="green" size="lg">
              Start studying free
            </Button>
            <Button to="/login" variant="neutral" size="lg">
              Log in
            </Button>
          </div>
        </div>

        {/* Auto-flipping demo card */}
        <div className="relative mx-auto h-72 w-full max-w-sm">
          <div className="absolute inset-0 rotate-6 rounded-2xl border-[3px] border-black bg-sky-100 shadow-hard-lg" />
          <div className="absolute inset-0 rotate-3 rounded-2xl border-[3px] border-black bg-amber-100 shadow-hard-lg" />
          <div className="flip-card absolute inset-0">
            <div className="flip-card-inner animate-autoflip relative h-full w-full">
              <div className="flip-card-face absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-[3px] border-black bg-amber-200 p-6 text-center shadow-hard-xl">
                <p className="text-4xl font-bold text-ink">agricola</p>
                <p className="absolute bottom-4 text-xs font-bold uppercase tracking-widest text-stone-600">
                  front
                </p>
              </div>
              <div className="flip-card-face flip-card-back absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-[3px] border-black bg-sky-200 p-6 text-center shadow-hard-xl">
                <p className="text-3xl font-bold text-ink">farmer</p>
                <p className="text-sm font-medium text-stone-700">
                  agricola, agricolae · m
                </p>
                <p className="text-sm font-medium text-stone-700">
                  1st declension
                </p>
                <p className="absolute bottom-4 text-xs font-bold uppercase tracking-widest text-stone-600">
                  back
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modes */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight text-ink">
          Nine ways to study
        </h2>
        <p className="mt-2 max-w-2xl font-medium text-stone-600">
          Different material needs different drilling. Switch modes any time
          without rebuilding your cards.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STUDY_MODES.map((mode) => (
            <Panel key={mode.id} className={`${mode.color} p-4`}>
              <p className="flex items-center gap-2 font-bold text-ink">
                {mode.name}
                {mode.playful && (
                  <span className="rounded-full border border-black bg-white px-1.5 text-[10px] font-bold uppercase">
                    game
                  </span>
                )}
              </p>
              <p className="mt-1.5 text-sm font-medium text-stone-700">
                {mode.blurb}
              </p>
            </Panel>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight text-ink">
          Built for real coursework
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SUBJECTS.map((s) => (
            <Panel key={s.title} className={`${s.tone} p-5`}>
              <h3 className="text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm font-medium text-stone-700">
                {s.body}
              </p>
              {s.sample && (
                <code className="mt-3 block rounded-lg border-2 border-black bg-white px-2 py-1 text-xs">
                  ${s.sample}$
                </code>
              )}
            </Panel>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight text-ink">
          How it works
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black bg-white text-xl font-bold shadow-hard">
                {step.n}
              </span>
              <div>
                <h3 className="font-bold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm font-medium text-stone-600">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <Panel raised className="bg-amber-300 p-8 text-center sm:p-12">
        <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Make your first set in about a minute
        </h2>
        <p className="mx-auto mt-3 max-w-lg font-medium text-stone-700">
          Paste in a vocabulary list, pick a mode, and start. Your cards and
          progress sync to your account.
        </p>
        <Button to="/signup" variant="green" size="lg" className="mt-6">
          Create a free account
        </Button>
      </Panel>
    </div>
  )
}

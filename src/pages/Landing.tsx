import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'

const FEATURES: { title: string; body: string; bg: string }[] = [
  {
    title: 'Any subject',
    body: 'Front and back on every card, plus your own custom fields per set — gender, formulas, dates, whatever the subject needs.',
    bg: 'bg-amber-200',
  },
  {
    title: 'Six ways to study',
    body: 'Classic flip, the stack method, the dot method, a 5-minute speed round, multiple choice, and type-the-answer.',
    bg: 'bg-sky-200',
  },
  {
    title: 'Mix and categorize',
    body: 'Organize sets by category and tags, then combine several sets into one mixed study session whenever you want extra practice.',
    bg: 'bg-emerald-200',
  },
]

export function Landing() {
  return (
    <div className="flex flex-col gap-10 py-6">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
          Flashcards that actually help you study
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-medium text-slate-600">
          Build flashcard sets for any class or subject, organize them your
          way, and drill them with study modes built around how memorization
          really works.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button to="/signup" variant="green" className="text-lg">
            Sign up free
          </Button>
          <Button to="/login" variant="neutral" className="text-lg">
            Log in
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Panel key={f.title} className={`${f.bg} p-5`}>
            <h2 className="text-lg font-extrabold text-slate-900">
              {f.title}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {f.body}
            </p>
          </Panel>
        ))}
      </div>
    </div>
  )
}

import { useLocation, useNavigate } from 'react-router-dom'
import type { FlashCard, FlashSet, StudyMode } from '../types'
import { Button } from '../components/ui/Button'
import { ClassicFlip } from './study/ClassicFlip'
import { StackMethod } from './study/StackMethod'
import { DotMethod } from './study/DotMethod'
import { SpeedRound } from './study/SpeedRound'
import { MultipleChoice } from './study/MultipleChoice'
import { TypeAnswer } from './study/TypeAnswer'

interface SessionState {
  cards: FlashCard[]
  sets: FlashSet[]
  mode: StudyMode
}

export function StudySession() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as SessionState | undefined

  if (!state || !state.cards || state.cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="font-medium text-slate-600">
          No active study session. Pick a set to get started.
        </p>
        <Button to="/study" variant="green">
          Choose Sets
        </Button>
      </div>
    )
  }

  const { cards, sets, mode } = state
  const setById = new Map(sets.map((s) => [s.id, s]))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Studying {cards.length} card{cards.length === 1 ? '' : 's'}
        </h1>
        <Button onClick={() => navigate('/study')} variant="neutral" size="sm">
          Exit
        </Button>
      </div>

      {mode === 'flip' && <ClassicFlip cards={cards} setById={setById} />}
      {mode === 'stack' && <StackMethod cards={cards} setById={setById} />}
      {mode === 'dots' && <DotMethod cards={cards} setById={setById} />}
      {mode === 'speed' && <SpeedRound cards={cards} setById={setById} />}
      {mode === 'choice' && <MultipleChoice cards={cards} />}
      {mode === 'type' && <TypeAnswer cards={cards} setById={setById} />}
    </div>
  )
}

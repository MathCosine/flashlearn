import { type ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { isMuted, setMuted } from '../lib/sound'
import { Button } from './ui/Button'

const NAV = [
  { to: '/', label: 'My sets' },
  { to: '/study', label: 'Study' },
  { to: '/stats', label: 'Progress' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [muted, setMutedState] = useState(isMuted)

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function toggleSound() {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b-[3px] border-black bg-amber-300">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink"
          >
            <span
              aria-hidden
              className="h-6 w-6 rounded-md border-[3px] border-black bg-emerald-400"
            />
            FlashLearn
          </Link>

          {user ? (
            <nav className="flex flex-wrap items-center gap-1.5">
              {NAV.map((item) => {
                const active =
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`rounded-lg border-2 border-black px-3 py-1.5 text-sm font-bold transition-colors ${
                      active ? 'bg-ink text-white' : 'bg-white hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <button
                onClick={toggleSound}
                aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
                title={muted ? 'Sounds off' : 'Sounds on'}
                className="rounded-lg border-2 border-black bg-white px-2.5 py-1.5 text-sm font-bold hover:bg-stone-100"
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <Button onClick={handleSignOut} variant="neutral" size="sm">
                Sign out
              </Button>
            </nav>
          ) : (
            <nav className="flex items-center gap-2">
              <Button to="/login" variant="neutral" size="sm">
                Log in
              </Button>
              <Button to="/signup" variant="green" size="sm">
                Sign up
              </Button>
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>

      <footer className="border-t-[3px] border-black bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm font-medium text-stone-500">
          FlashLearn — your cards, your progress, private to your account.
        </div>
      </footer>
    </div>
  )
}

import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Button } from './ui/Button'

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b-[3px] border-black bg-yellow-300">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-extrabold text-slate-900"
          >
            <span>🗃️</span>
            <span>FlashLearn</span>
          </Link>
          {user && (
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Button to="/" variant="neutral" size="sm">
                My Sets
              </Button>
              <Button to="/study" variant="blue" size="sm">
                Study / Mix Sets
              </Button>
              <span className="hidden px-2 font-medium text-slate-800 sm:inline">
                {user.email}
              </span>
              <Button onClick={handleSignOut} variant="neutral" size="sm">
                Sign out
              </Button>
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  )
}

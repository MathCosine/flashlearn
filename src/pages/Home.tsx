import { useAuth } from '../context/AuthContext'
import { Dashboard } from './Dashboard'
import { Landing } from './Landing'

// The "/" route is auth-aware: signed-out visitors see the marketing
// landing page, signed-in users go straight to their dashboard.
export function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center font-medium text-slate-500">
        Loading…
      </div>
    )
  }

  return user ? <Dashboard /> : <Landing />
}

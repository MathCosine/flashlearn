import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/')
  }

  return (
    <Panel className="mx-auto mt-16 max-w-sm bg-sky-100 p-6">
      <h1 className="mb-4 text-2xl font-extrabold text-slate-900">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border-[3px] border-black bg-white px-3 py-2 font-medium"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border-[3px] border-black bg-white px-3 py-2 font-medium"
        />
        {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
        <Button type="submit" variant="green" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-700">
        No account?{' '}
        <Link to="/signup" className="font-bold underline">
          Sign up
        </Link>
      </p>
    </Panel>
  )
}

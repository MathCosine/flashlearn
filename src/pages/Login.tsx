import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { Field, Input } from '../components/ui/Field'

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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/')
  }

  return (
    <Panel raised className="mx-auto mt-10 max-w-sm bg-white p-6">
      <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm font-medium text-stone-500">
        Your sets and progress are waiting.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <Field label="Email">
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && (
          <p className="rounded-lg border-2 border-black bg-rose-200 px-3 py-2 text-sm font-semibold text-rose-950">
            {error}
          </p>
        )}
        <Button type="submit" variant="green" disabled={loading} full>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className="mt-4 text-sm font-medium text-stone-600">
        No account?{' '}
        <Link to="/signup" className="font-bold underline">
          Sign up
        </Link>
      </p>
    </Panel>
  )
}

import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'

export function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      navigate('/')
      return
    }
    setInfo(
      'Account created! Check your email to confirm it, then log in. ' +
        '(If you turned off email confirmation in Supabase, try logging in now.)',
    )
  }

  return (
    <Panel className="mx-auto mt-16 max-w-sm bg-emerald-100 p-6">
      <h1 className="mb-4 text-2xl font-extrabold text-slate-900">
        Create an account
      </h1>
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
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border-[3px] border-black bg-white px-3 py-2 font-medium"
        />
        {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
        {info && <p className="text-sm font-semibold text-emerald-800">{info}</p>}
        <Button type="submit" variant="green" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-700">
        Already have an account?{' '}
        <Link to="/login" className="font-bold underline">
          Log in
        </Link>
      </p>
    </Panel>
  )
}

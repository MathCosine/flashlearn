import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { Field, Input } from '../components/ui/Field'

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
      'Account created. Check your email to confirm it, then log in. (If email confirmation is turned off in Supabase, you can log in right away.)',
    )
  }

  return (
    <Panel raised className="mx-auto mt-10 max-w-sm bg-white p-6">
      <h1 className="text-2xl font-bold text-ink">Create your account</h1>
      <p className="mt-1 text-sm font-medium text-stone-500">
        Free, and your cards stay private to you.
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
        <Field label="Password" hint="At least 6 characters.">
          <Input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && (
          <p className="rounded-lg border-2 border-black bg-rose-200 px-3 py-2 text-sm font-semibold text-rose-950">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-lg border-2 border-black bg-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-950">
            {info}
          </p>
        )}
        <Button type="submit" variant="green" disabled={loading} full>
          {loading ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
      <p className="mt-4 text-sm font-medium text-stone-600">
        Already have an account?{' '}
        <Link to="/login" className="font-bold underline">
          Log in
        </Link>
      </p>
    </Panel>
  )
}

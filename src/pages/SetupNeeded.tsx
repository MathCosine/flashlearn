import { Panel } from '../components/ui/Panel'

/**
 * Shown instead of a blank page when the Supabase keys are missing, so a
 * misconfigured deploy explains itself.
 */
export function SetupNeeded() {
  return (
    <div className="mx-auto max-w-xl py-12">
      <Panel raised className="bg-white p-8">
        <h1 className="text-2xl font-bold text-ink">Almost there</h1>
        <p className="mt-3 font-medium text-stone-600">
          FlashLearn can't reach its database because the Supabase keys
          aren't set for this build.
        </p>
        <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 font-medium text-stone-600">
          <li>
            Running locally? Copy <code>.env.example</code> to{' '}
            <code>.env.local</code> and fill in your project URL and
            publishable key, then restart <code>npm run dev</code>.
          </li>
          <li>
            Deployed on GitHub Pages? Add{' '}
            <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> as repository secrets under
            Settings → Secrets and variables → Actions, then re-run the
            deploy workflow.
          </li>
        </ul>
      </Panel>
    </div>
  )
}

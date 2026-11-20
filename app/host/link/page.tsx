import Link from 'next/link'

/** Simple entry from student app into host signup / onboarding */
export default function HostLinkPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">List a home on Domu Match</h1>
      <p className="text-ink-500">
        For private landlords and agencies. Students apply with compatibility scores. Identity
        stays hidden until you make an offer.
      </p>
      <div className="flex flex-col items-center gap-3 pt-2">
        <Link
          href="/auth/sign-up/host"
          className="inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Create host account
        </Link>
        <Link
          href="/auth/sign-in?redirect=/host/onboarding"
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  )
}

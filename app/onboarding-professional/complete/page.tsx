import { redirect } from 'next/navigation'

/** Legacy route: questionnaire submit now goes straight to the dashboard. */
export default function CompletePage() {
  redirect('/dashboard')
}

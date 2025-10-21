import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import IntroClient from './pageClient'

export default async function IntroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')
  return <IntroClient />
}



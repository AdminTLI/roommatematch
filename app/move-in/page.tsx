import { AppShell } from '@/components/app/shell'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MoveInContent } from './components/move-in-content'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function MoveInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check feature flag
  if (!isFeatureEnabled('move_in')) {
    // Check if user is admin (admins can still access)
    const admin = await createAdminClient()
    const { data: adminRecord } = await admin
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adminRecord) {
      // Show "Coming soon" page for non-admins
      return (
        <AppShell user={{
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || 'User',
          avatar: user.user_metadata?.avatar_url
        }}>
          <div className="max-w-2xl mx-auto py-12">
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  The move-in planner feature is currently under development and will be available soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  We're working hard to bring you a comprehensive move-in planning feature. 
                  In the meantime, you can use the matching and chat features to coordinate with your roommates.
                </p>
              </CardContent>
            </Card>
          </div>
        </AppShell>
      )
    }
  }

  return (
    <AppShell user={{
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || 'User',
      avatar: user.user_metadata?.avatar_url
    }}>
      <MoveInContent />
    </AppShell>
  )
}

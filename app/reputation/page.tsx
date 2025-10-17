// Reputation Page - Main page for viewing and managing reputation

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ReputationProfile, ReputationPreview, ReputationInsights } from '@/app/(components)/reputation-profile'
import { getDemoReputationSummary, getDemoEndorsements, getDemoReferences } from '@/lib/reputation/utils'
import type { UserReputationSummary, Endorsement, Reference } from '@/lib/reputation/types'
import { User } from '@supabase/supabase-js'

export default function ReputationPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userReputation, setUserReputation] = useState<UserReputationSummary | null>(null)
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [references, setReferences] = useState<Reference[]>([])

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/sign-in')
          return
        }

        setUser(user)

        // For demo purposes, use demo data
        if (user.id === 'demo-user-id') {
          setUserReputation(getDemoReputationSummary())
          setEndorsements(getDemoEndorsements())
          setReferences(getDemoReferences())
        } else {
          // TODO: Load real data from Supabase
          // const reputation = await getUserReputationSummary(user.id)
          // const userEndorsements = await getEndorsementsForUser(user.id)
          // const userReferences = await getReferencesForUser(user.id)
          // setUserReputation(reputation)
          // setEndorsements(userEndorsements)
          // setReferences(userReferences)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reputation profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !userReputation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Reputation Profile Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn&apos;t load your reputation profile. Please try again later.
          </p>
          <button
            onClick={() => router.push('/matches')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Matches
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            My Reputation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your reputation profile shows how others have rated you as a roommate and community member.
          </p>
        </div>

        <ReputationProfile
          userReputation={userReputation}
          endorsements={endorsements}
          references={references}
          isOwnProfile={true}
        />

        <ReputationInsights
          userReputation={userReputation}
          className="mt-6"
        />
      </div>
    </div>
  )
}

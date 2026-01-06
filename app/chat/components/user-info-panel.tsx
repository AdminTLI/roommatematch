'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'

interface UserInfoData {
  first_name: string | null
  last_name: string | null
  bio: string | null
  interests: string[]
}

interface UserInfoPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userInfo: UserInfoData | null
  isLoading?: boolean
  error?: string | null
}

export function UserInfoPanel({
  open,
  onOpenChange,
  userInfo,
  isLoading = false,
  error = null
}: UserInfoPanelProps) {
  if (!open) return null

  const displayName = userInfo
    ? `${userInfo.first_name || ''}${userInfo.last_name ? ` ${userInfo.last_name}` : ''}`.trim() || 'User'
    : 'User'

  return (
    <div className="flex flex-col h-full w-full bg-bg-surface overflow-hidden">
      {/* Header with Back Button */}
      <div className="flex-shrink-0 bg-bg-surface border-b border-border-subtle shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 p-0 rounded-lg hover:bg-bg-surface-alt"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to chat</span>
            </Button>
            <h1 className="text-xl font-bold text-text-primary">User Details</h1>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-32 bg-bg-surface-alt rounded-lg animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-bg-surface-alt rounded animate-pulse w-3/4"></div>
                    <div className="h-2 bg-bg-surface-alt rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-text-muted mb-2">
                {error}
              </p>
              <p className="text-xs text-text-muted">
                Please try again later.
              </p>
            </div>
          ) : userInfo ? (
            <div className="space-y-6">
              {/* Name Section */}
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary">{displayName}</h2>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bio Section */}
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Bio</h3>
                  {userInfo.bio && userInfo.bio.trim() ? (
                    <p className="text-base text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {userInfo.bio}
                    </p>
                  ) : (
                    <p className="text-sm text-text-muted italic">
                      This user hasn't added a bio yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Interests Section */}
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Interests</h3>
                  {userInfo.interests && userInfo.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userInfo.interests.map((interest, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1.5 text-sm bg-primary/10 text-primary border-primary/20"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted italic">
                      This user hasn't added interests yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-text-muted">
                Unable to load user information. Please try again later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


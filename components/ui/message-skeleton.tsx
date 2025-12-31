'use client'

import { Skeleton } from './skeleton'
import { Avatar, AvatarFallback } from './avatar'

interface MessageSkeletonProps {
  isOwn?: boolean
}

export function MessageSkeleton({ isOwn = false }: MessageSkeletonProps) {
  return (
    <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <Avatar className="w-8 h-8 sm:w-7 sm:h-7 flex-shrink-0">
          <AvatarFallback>
            <Skeleton className="w-full h-full rounded-full" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isOwn ? 'order-first' : ''}`}>
        {!isOwn && (
          <div className="mb-1.5 px-1">
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        )}
        <div className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 ${
          isOwn 
            ? 'bg-semantic-accent/20' 
            : 'bg-bg-surface-alt'
        }`}>
          {/* Variable width lines to simulate message content */}
          <Skeleton className="h-4 w-32 sm:w-40 mb-2 rounded" />
          <Skeleton className="h-4 w-24 sm:w-32 rounded" />
        </div>
        <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <Skeleton className="h-2.5 w-12 rounded" />
        </div>
      </div>
    </div>
  )
}














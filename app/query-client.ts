import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        const status = (error as Error & { status?: number })?.status
        if (status && status >= 400 && status < 500) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})

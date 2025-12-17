/**
 * Query performance monitoring utility
 * Only active in development to catch slow queries
 */

/**
 * Monitor query performance and warn about slow queries
 * @param queryName - Name of the query for logging
 * @param queryFn - The query function to monitor
 * @returns Promise with the query result
 */
export function monitorQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== 'development') {
    return queryFn()
  }
  
  const start = Date.now()
  return queryFn().then((result) => {
    const duration = Date.now() - start
    if (duration > 1000) {
      console.warn(`[Slow Query] ${queryName} took ${duration}ms`)
    } else if (duration > 500) {
      console.info(`[Query] ${queryName} took ${duration}ms`)
    }
    return result
  }).catch((error) => {
    const duration = Date.now() - start
    console.error(`[Query Error] ${queryName} failed after ${duration}ms:`, error)
    throw error
  })
}


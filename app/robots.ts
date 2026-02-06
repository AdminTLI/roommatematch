import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://domumatch.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/dashboard/',
          '/onboarding/',
          '/matches/',
          '/chat/',
          '/settings/',
          '/verify/',
          '/housing/',
          '/notifications/',
          '/reputation/',
          '/forum/',
          '/video-intros/',
          '/move-in/',
          '/agreements/',
          '/safety/',
          '/accessibility/',
          '/sentry-example-page/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/dashboard/',
          '/onboarding/',
          '/matches/',
          '/chat/',
          '/settings/',
          '/verify/',
          '/housing/',
          '/notifications/',
          '/reputation/',
          '/forum/',
          '/video-intros/',
          '/move-in/',
          '/agreements/',
          '/safety/',
          '/accessibility/',
          '/sentry-example-page/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}


import { PastelMeshBackgroundStatic } from '@/components/site/pastel-mesh-background-static'
import { HomepageAboveFold } from './components/homepage-above-fold'
import { HomepageBelowFold } from './components/homepage-below-fold'
import { homepageStructuredData } from './homepage-structured-data'

export default function MarketingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageStructuredData) }}
      />
      <main id="main-content" className="relative pt-16 md:pt-20 overflow-hidden">
        <PastelMeshBackgroundStatic />
        <div className="relative z-10">
          <HomepageAboveFold />
          <HomepageBelowFold />
        </div>
      </main>
    </>
  )
}

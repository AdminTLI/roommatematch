import { UniversitiesPage } from './components/universities-page'
import { UniversitiesHeader } from './components/universities-header'
import { UniversitiesFooter } from './components/universities-footer'

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md transition-all duration-200"
      >
        Skip to main content
      </a>

      {/* Header */}
      <UniversitiesHeader />

      {/* Main Content */}
      <main id="main-content">
        <UniversitiesPage />
      </main>

      {/* Footer */}
      <UniversitiesFooter />
    </div>
  )
}

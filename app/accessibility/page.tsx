import { AuthHeader } from '@/app/auth/components/auth-header'
import { AuthFooter } from '@/app/auth/components/auth-footer'

export default function AccessibilityPage() {
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
      <AuthHeader />

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Accessibility Statement
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            <strong>Last updated:</strong> December 2024
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Our Commitment
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Domu Match is committed to ensuring digital accessibility for people with 
                disabilities. We continually improve the user experience for everyone and apply 
                the relevant accessibility standards, including WCAG 2.2 AA guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Accessibility Features
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Navigation and Structure
              </h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Skip navigation links to bypass repetitive content</li>
                <li>Logical heading structure and document outline</li>
                <li>Consistent navigation patterns throughout the platform</li>
                <li>Breadcrumb navigation for complex workflows</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 mt-6">
                Visual Design
              </h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>High contrast color schemes with WCAG AA compliance</li>
                <li>Resizable text up to 200% without horizontal scrolling</li>
                <li>Focus indicators visible on all interactive elements</li>
                <li>Support for dark mode and user preference settings</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 mt-6">
                Forms and Input
              </h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Clear labels and instructions for all form fields</li>
                <li>Error messages that identify the field and describe the error</li>
                <li>Required field indicators and validation feedback</li>
                <li>Keyboard-accessible form controls and navigation</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 mt-6">
                Content and Media
              </h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Alternative text for all images and graphics</li>
                <li>Descriptive link text that indicates destination</li>
                <li>Transcripts and captions for audio/video content</li>
                <li>Plain language and clear communication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Keyboard Navigation
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Our platform is fully navigable using only a keyboard. Here are the key shortcuts:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <ul className="list-none text-gray-700 dark:text-gray-300 space-y-2">
                  <li><strong>Tab:</strong> Move forward through interactive elements</li>
                  <li><strong>Shift + Tab:</strong> Move backward through interactive elements</li>
                  <li><strong>Enter/Space:</strong> Activate buttons and links</li>
                  <li><strong>Escape:</strong> Close modals and dropdowns</li>
                  <li><strong>Arrow Keys:</strong> Navigate within menus and lists</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Screen Reader Support
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We ensure compatibility with popular screen readers including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>NVDA (Windows)</li>
                <li>JAWS (Windows)</li>
                <li>VoiceOver (macOS/iOS)</li>
                <li>TalkBack (Android)</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                Our platform includes proper ARIA labels, landmarks, and semantic HTML 
                to provide a comprehensive screen reader experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Assistive Technology Compatibility
              </h2>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Voice control software (Dragon NaturallySpeaking, Voice Control)</li>
                <li>Switch navigation devices</li>
                <li>Eye tracking software</li>
                <li>Magnification software (ZoomText, MAGic)</li>
                <li>Text-to-speech applications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Testing and Validation
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We regularly test our platform for accessibility using:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Automated accessibility testing tools (axe-core, WAVE)</li>
                <li>Manual testing with assistive technologies</li>
                <li>User testing with people with disabilities</li>
                <li>Expert accessibility audits and reviews</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Known Limitations
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                While we strive to make our platform fully accessible, we acknowledge that 
                some areas may need improvement. We are continuously working to enhance 
                accessibility across all features and welcome feedback from users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Feedback and Support
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We welcome your feedback on the accessibility of Domu Match. If you 
                encounter any accessibility barriers or have suggestions for improvement, 
                please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> info@domumatch.com<br />
                  <strong>Phone:</strong> +31 (0) 20 123 4567<br />
                  <strong>Response time:</strong> We aim to respond within 48 hours
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Standards Compliance
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                This website aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 
                Level AA. These guidelines explain how to make web content more accessible for people 
                with disabilities and user-friendly for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Updates to This Statement
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We will update this accessibility statement as we make improvements to our platform. 
                The last update was made in December 2024.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  )
}

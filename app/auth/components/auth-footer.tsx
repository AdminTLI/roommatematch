export function AuthFooter() {
  return (
    <footer className="w-full py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            © 2026 Domu Match. All rights reserved.
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4">
            <a 
              href="/privacy" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Terms of Service
            </a>
            <a 
              href="/accessibility" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
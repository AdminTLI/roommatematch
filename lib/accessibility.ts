// Accessibility utilities and helpers
// Common accessibility patterns and utilities

export function getAriaLabel(element: string, context?: string): string {
  const labels: Record<string, string> = {
    'search': 'Search listings',
    'filter': 'Filter options',
    'sort': 'Sort listings',
    'view': 'View mode',
    'save': 'Save listing',
    'share': 'Share listing',
    'report': 'Report listing',
    'close': 'Close',
    'next': 'Next',
    'previous': 'Previous',
    'menu': 'Menu',
    'close-menu': 'Close menu'
  }

  const baseLabel = labels[element] || element
  return context ? `${baseLabel} ${context}` : baseLabel
}

export function getAriaDescribedBy(element: string): string {
  const descriptions: Record<string, string> = {
    'compatibility-score': 'compatibility-explanation',
    'price': 'price-breakdown',
    'amenities': 'amenities-list',
    'verification': 'verification-details'
  }

  return descriptions[element] || ''
}

export function getRoleDescription(element: string): string {
  const roles: Record<string, string> = {
    'filter-chip': 'Filter option, click to remove',
    'sort-option': 'Sort option',
    'view-toggle': 'View mode selector',
    'compatibility-badge': 'Compatibility score with explanation',
    'verification-badge': 'University verification status'
  }

  return roles[element] || ''
}

export function getKeyboardInstructions(action: string): string {
  const instructions: Record<string, string> = {
    'navigate': 'Use arrow keys to navigate',
    'select': 'Press Enter to select',
    'close': 'Press Escape to close',
    'toggle': 'Press Space to toggle',
    'filter': 'Use Tab to navigate filters, Enter to apply'
  }

  return instructions[action] || ''
}

// Focus management utilities
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)

  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

export function restoreFocus(previousElement: HTMLElement | null) {
  if (previousElement && typeof previousElement.focus === 'function') {
    previousElement.focus()
  }
}

// Screen reader utilities
export function announceToScreenReader(message: string) {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color contrast library
  return 4.5 // Placeholder - would calculate actual contrast ratio
}

export function isHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches
}

export function isReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// ARIA utilities
export function getAriaExpanded(isExpanded: boolean): string {
  return isExpanded.toString()
}

export function getAriaSelected(isSelected: boolean): string {
  return isSelected.toString()
}

export function getAriaPressed(isPressed: boolean): string {
  return isPressed.toString()
}

export function getAriaHidden(isHidden: boolean): string {
  return isHidden.toString()
}

// Keyboard navigation utilities
export function handleArrowKeyNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number
): number {
  const { key } = event
  let newIndex = currentIndex

  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      newIndex = (currentIndex + 1) % items.length
      break
    case 'ArrowUp':
    case 'ArrowLeft':
      newIndex = (currentIndex - 1 + items.length) % items.length
      break
    case 'Home':
      newIndex = 0
      break
    case 'End':
      newIndex = items.length - 1
      break
    default:
      return currentIndex
  }

  event.preventDefault()
  items[newIndex]?.focus()
  return newIndex
}

// Form accessibility utilities
export function getFieldErrorId(fieldId: string): string {
  return `${fieldId}-error`
}

export function getFieldHelpId(fieldId: string): string {
  return `${fieldId}-help`
}

export function getFieldDescribedBy(fieldId: string, hasError: boolean, hasHelp: boolean): string {
  const ids = []
  if (hasError) ids.push(getFieldErrorId(fieldId))
  if (hasHelp) ids.push(getFieldHelpId(fieldId))
  return ids.join(' ')
}

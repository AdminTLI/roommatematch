// Toast utilities for user feedback
// Simple toast implementation using browser notifications

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

// Simple toast implementation
export function showToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9)
  const fullToast: Toast = {
    id,
    duration: 5000,
    ...toast
  }

  // In a real implementation, this would use a toast library like sonner
  console.log('Toast:', fullToast)
  
  // For now, just use browser notification
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(fullToast.title, {
        body: fullToast.description,
        icon: '/favicon.ico'
      })
    }
  }

  return id
}

export function showSuccessToast(title: string, description?: string) {
  return showToast({ type: 'success', title, description })
}

export function showErrorToast(title: string, description?: string) {
  return showToast({ type: 'error', title, description })
}

export function showWarningToast(title: string, description?: string) {
  return showToast({ type: 'warning', title, description })
}

export function showInfoToast(title: string, description?: string) {
  return showToast({ type: 'info', title, description })
}

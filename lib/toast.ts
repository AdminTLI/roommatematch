// Toast utilities for user feedback
// Using Sonner for toast notifications

import { toast } from 'sonner'

export function showSuccessToast(title: string, description?: string) {
  return toast.success(title, {
    description,
    duration: 5000,
  })
}

export function showErrorToast(title: string, description?: string) {
  return toast.error(title, {
    description,
    duration: 7000,
  })
}

export function showWarningToast(title: string, description?: string) {
  return toast.warning(title, {
    description,
    duration: 5000,
  })
}

export function showInfoToast(title: string, description?: string) {
  return toast.info(title, {
    description,
    duration: 5000,
  })
}

export function showToast(title: string, description?: string) {
  return toast(title, {
    description,
    duration: 5000,
  })
}

'use client'

import * as React from 'react'
import { Toast, ToastProvider, ToastTitle, ToastViewport } from '@radix-ui/react-toast'

export function AutosaveToaster({ show }: { show: boolean }) {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    if (show) {
      setOpen(false)
      const t = setTimeout(() => setOpen(true), 0)
      const c = setTimeout(() => setOpen(false), 1500)
      return () => {
        clearTimeout(t)
        clearTimeout(c)
      }
    }
  }, [show])

  return (
    <ToastProvider swipeDirection="right">
      <Toast open={open} onOpenChange={setOpen} className="bg-gray-900 text-white px-3 py-2 rounded-md">
        <ToastTitle>Saved</ToastTitle>
      </Toast>
      <ToastViewport className="fixed bottom-4 right-4" />
    </ToastProvider>
  )
}



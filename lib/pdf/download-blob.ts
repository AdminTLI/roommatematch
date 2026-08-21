/**
 * Download a blob as a file with iOS-friendly fallbacks.
 * Synthetic <a download> often fails in iOS Safari/Chrome; prefer share, then open-in-tab.
 */
export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, {
    type: blob.type || 'application/pdf',
  })

  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })

  if (canShareFiles) {
    try {
      await navigator.share({ files: [file], title: filename })
      return
    } catch (err) {
      // User cancelled share — treat as done; other errors fall through.
      if (err instanceof DOMException && err.name === 'AbortError') return
    }
  }

  const url = URL.createObjectURL(blob)
  try {
    const isIos =
      typeof navigator !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

    if (isIos) {
      // iOS ignores download attribute for blobs; open so the user can share/save.
      const opened = window.open(url, '_blank')
      if (!opened) {
        // Popup blocked — navigate current tab as last resort.
        window.location.href = url
      }
      // Delay revoke so the new tab can read the blob.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      return
    }

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.setTimeout(() => URL.revokeObjectURL(url), 2_000)
  } catch {
    URL.revokeObjectURL(url)
    throw new Error('Unable to save the PDF on this device.')
  }
}

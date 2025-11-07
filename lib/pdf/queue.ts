/**
 * Simple in-memory queue for PDF generation to limit concurrency
 * Prevents resource exhaustion from too many simultaneous Puppeteer instances
 */

interface QueueItem {
  resolve: (value: void) => void
  reject: (error: Error) => void
}

class PDFGenerationQueue {
  private queue: QueueItem[] = []
  private running = 0
  private readonly maxConcurrent: number

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent
  }

  async acquire(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.running < this.maxConcurrent) {
        this.running++
        resolve()
      } else {
        this.queue.push({ resolve, reject })
      }
    })
  }

  release(): void {
    this.running--
    if (this.queue.length > 0) {
      const next = this.queue.shift()!
      this.running++
      next.resolve()
    }
  }

  getQueueLength(): number {
    return this.queue.length
  }

  getRunningCount(): number {
    return this.running
  }

  isFull(): boolean {
    return this.running >= this.maxConcurrent && this.queue.length >= 10 // Max queue size
  }
}

// Singleton instance
export const pdfQueue = new PDFGenerationQueue(3)


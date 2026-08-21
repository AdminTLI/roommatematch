import type { Browser } from 'puppeteer-core'

type RenderPdfOptions = {
  timeoutMs?: number
}

function useServerlessChromium(): boolean {
  if (process.env.PDF_USE_SERVERLESS_CHROMIUM === '1') return true
  if (process.env.PDF_USE_SERVERLESS_CHROMIUM === '0') return false
  // Vercel / Lambda only — local `next start` keeps full Puppeteer.
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
}

async function launchBrowser(): Promise<Browser> {
  if (useServerlessChromium()) {
    const chromium = (await import('@sparticuz/chromium')).default
    const puppeteer = await import('puppeteer-core')
    return puppeteer.default.launch({
      args: chromium.args,
      defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  const puppeteer = await import('puppeteer')
  return puppeteer.default.launch({
    headless: true,
    args: [
      '--font-render-hinting=none',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu',
    ],
  }) as unknown as Browser
}

export async function renderPdf(html: string, options: RenderPdfOptions = {}): Promise<Buffer> {
  const timeoutMs = options.timeoutMs ?? 30000
  const browser = await launchBrowser()

  try {
    let timer: NodeJS.Timeout | undefined
    let timedOut = false
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true
        // Attempt to abort in-flight operations; close may itself fail in some environments.
        browser.close().catch(() => {})
        reject(new Error(`PDF generation timeout after ${Math.round(timeoutMs / 1000)} seconds`))
      }, timeoutMs)
    })

    const page = await browser.newPage()
    page.setDefaultTimeout(timeoutMs)

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    })

    const work = (async () => {
      await page.setContent(html, {
        waitUntil: 'networkidle0' as 'load',
        timeout: timeoutMs,
      })

      try {
        await page.evaluate(() => {
          if (typeof document !== 'undefined' && 'fonts' in document) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (document as any).fonts.ready
          }
          return null
        })
      } catch {
        // Non-fatal in dev / constrained environments
      }

      return await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="width:100%; font-size:8px; color:#64748B; padding:0 18px; display:flex; justify-content:space-between; align-items:center; font-family: system-ui, -apple-system, sans-serif;">
            <span>Domu Match · Confidential · GDPR</span>
            <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
            <span>domumatch.com</span>
          </div>
        `,
        margin: {
          top: '12mm',
          right: '12mm',
          bottom: '16mm',
          left: '12mm',
        },
      })
    })()

    try {
      const pdfBytes = await Promise.race([work, timeoutPromise])
      return Buffer.from(pdfBytes)
    } finally {
      if (timer) clearTimeout(timer)
      if (timedOut) {
        work.catch(() => {})
      }
    }
  } finally {
    await browser.close()
  }
}

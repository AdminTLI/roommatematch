import puppeteer from 'puppeteer';

type RenderPdfOptions = {
  timeoutMs?: number;
};

export async function renderPdf(html: string, options: RenderPdfOptions = {}): Promise<Buffer> {
  const timeoutMs = options.timeoutMs ?? 30000;
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--font-render-hinting=none',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu',
    ],
  });

  try {
    let timer: NodeJS.Timeout | undefined;
    let timedOut = false;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        // Attempt to abort in-flight operations; close may itself fail in some environments.
        browser.close().catch(() => {});
        reject(new Error(`PDF generation timeout after ${Math.round(timeoutMs / 1000)} seconds`));
      }, timeoutMs);
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(timeoutMs);

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      deviceScaleFactor: 1,
    });

    const work = (async () => {
      // Set content and wait for fonts to load
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: timeoutMs,
      });

      // Wait for fonts to be loaded (ignore in environments without document.fonts)
      try {
        await page.evaluate(() => {
          if (typeof document !== 'undefined' && 'fonts' in document) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (document as any).fonts.ready;
          }
          return null;
        });
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
          <div style="width:100%; font-size:8px; color:#444; padding:0 16px; display:flex; justify-content:space-between; font-family: 'Inter', sans-serif;">
            <span class="section"></span>
            <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
            <span>${new Date().toISOString().slice(0,10)}</span>
          </div>
        `,
        margin: {
          top: '12mm',
          right: '12mm',
          bottom: '16mm',
          left: '12mm',
        },
      });
    })();

    try {
      return await Promise.race([work, timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
      if (timedOut) {
        // Ensure any late rejection from `work` doesn't become unhandled.
        work.catch(() => {});
      }
    }
  } finally {
    await browser.close();
  }
}

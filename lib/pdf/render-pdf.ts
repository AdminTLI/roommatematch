import puppeteer from 'puppeteer';

export async function renderPdf(html: string): Promise<Buffer> {
  // Use sandboxed Puppeteer for production security
  // Note: If running in Docker/containers, you may need to configure the container
  // to allow sandboxed processes (e.g., use --cap-add=SYS_ADMIN or run as non-root)
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--font-render-hinting=none',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu'
    ]
  });
  
  const page = await browser.newPage();
  
  // Set viewport for consistent rendering
  await page.setViewport({
    width: 794, // A4 width in pixels at 96 DPI
    height: 1123, // A4 height in pixels at 96 DPI
    deviceScaleFactor: 1
  });
  
  // Set content and wait for fonts to load
  await page.setContent(html, { 
    waitUntil: 'networkidle0',
    timeout: 30000
  });
  
  // Wait for fonts to be loaded
  await page.evaluateHandle('document.fonts.ready');
  
  // Wait a bit more for any dynamic content
  await page.waitForTimeout(1000);

  const pdf = await page.pdf({
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
      left: '12mm'
    }
  });

  await browser.close();
  return pdf;
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchReportData } from '@/lib/pdf/fetch-report-data';
import { normalizeSections } from '@/lib/pdf/normalize';
import { generateReportHtml } from '@/lib/pdf/generate-html';
import { renderPdf } from '@/lib/pdf/render-pdf';
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit';
import { pdfQueue } from '@/lib/pdf/queue';
import { safeLogger } from '@/lib/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 5 PDFs per hour per user
    const rateLimitKey = getUserRateLimitKey('pdf_generation', user.id);
    const rateLimitResult = await checkRateLimit('pdf_generation', rateLimitKey);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Check if queue is full
    if (pdfQueue.isFull()) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Acquire queue slot (waits if max concurrent reached)
    await pdfQueue.acquire();

    try {
      // Set timeout: kill Puppeteer after 30 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('PDF generation timeout after 30 seconds'));
        }, 30000);
      });

      // Fetch and normalize data
      const rawData = await fetchReportData(user.id);
      const normalizedData = normalizeSections(rawData);

      // Generate HTML using template strings (no JSX)
      const html = generateReportHtml(normalizedData);

      // Generate PDF with timeout
      const pdfBuffer = await Promise.race([
        renderPdf(html),
        timeoutPromise
      ]);

      // Return PDF with proper headers
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="roommate-profile-${user.id.slice(0, 8)}.pdf"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': (rateLimitResult.remaining - 1).toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      });
    } finally {
      // Always release queue slot
      pdfQueue.release();
    }

  } catch (error) {
    // Release queue slot on error
    pdfQueue.release();
    
    safeLogger.error('PDF generation error', error);
    
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'PDF generation timed out. Please try again.' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

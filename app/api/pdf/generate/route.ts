import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchReportData } from '@/lib/pdf/fetch-report-data';
import { normalizeSections } from '@/lib/pdf/normalize';
import { renderToString } from 'react-dom/server';
import { ReportShell } from '@/components/pdf/report-shell';
import { renderPdf } from '@/lib/pdf/render-pdf';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch and normalize data
    const rawData = await fetchReportData(user.id);
    const normalizedData = normalizeSections(rawData);

    // Render React component to HTML
    const html = renderToString(<ReportShell data={normalizedData} />);

    // Generate PDF
    const pdfBuffer = await renderPdf(html);

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="roommate-profile-${user.id.slice(0, 8)}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

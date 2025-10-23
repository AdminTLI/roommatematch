#!/usr/bin/env tsx

/**
 * Generate a sample PDF report for testing purposes
 * 
 * Usage:
 *   npm run generate:sample-pdf
 */

import { fetchReportData } from '@/lib/pdf/fetch-report-data';
import { normalizeSections } from '@/lib/pdf/normalize';
import { renderToString } from 'react-dom/server';
import { ReportShell } from '@/components/pdf/report-shell';
import { renderPdf } from '@/lib/pdf/render-pdf';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    console.log('🚀 Generating sample PDF report...');
    
    // Use demo user ID from seed data
    const demoUserId = '750e8400-e29b-41d4-a716-446655440001';
    
    console.log('📊 Fetching report data...');
    const rawData = await fetchReportData(demoUserId);
    
    console.log('🔧 Normalizing data...');
    const normalizedData = normalizeSections(rawData);
    
    console.log('🎨 Rendering HTML...');
    const html = renderToString(<ReportShell data={normalizedData} />);
    
    console.log('📄 Generating PDF...');
    const pdf = await renderPdf(html);
    
    // Create output directory
    const outputDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'sample-report.pdf');
    fs.writeFileSync(outputPath, pdf);
    
    console.log('✅ Sample PDF generated successfully!');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 Sections: ${normalizedData.sections.length}`);
    console.log(`📋 Student: ${normalizedData.student.name}`);
    
  } catch (error) {
    console.error('❌ Error generating sample PDF:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

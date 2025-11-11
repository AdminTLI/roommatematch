'use client'

import React from 'react';
import type { QuestionnaireResult } from '@/types/report';

interface ReportShellProps {
  data: QuestionnaireResult;
}

export function ReportShell({ data }: ReportShellProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Roommate Compatibility Report</title>
        <link rel="stylesheet" href="/pdf-styles.css" />
      </head>
      <body>
        <div className="report-container">
          <CoverPage student={data.student} date={data.generatedAtISO} />
          <TableOfContents sections={data.sections} />
          <SummaryPage sections={data.sections} />
          {data.sections.map(section => (
            <SectionBlock key={section.id} section={section} />
          ))}
          <DealBreakersRecap sections={data.sections} />
        </div>
      </body>
    </html>
  );
}

function CoverPage({ student, date }: { student: { name: string; email?: string }; date: string }) {
  return (
    <div className="page cover-page">
      <div className="cover-content">
        <div className="logo-section">
          <h1 className="brand-title">Domu Match</h1>
          <div className="brand-subtitle">Compatibility Report</div>
        </div>
        
        <div className="student-info">
          <h2 className="student-name">{student.name}</h2>
          {student.email && (
            <p className="student-email">{student.email}</p>
          )}
          <p className="report-date">Generated: {new Date(date).toLocaleDateString()}</p>
        </div>
        
        <div className="privacy-note">
          <p>This report contains personal preferences and should be shared only with potential roommates.</p>
        </div>
      </div>
    </div>
  );
}

function TableOfContents({ sections }: { sections: any[] }) {
  return (
    <div className="page toc-page">
      <h1>Table of Contents</h1>
      
      <nav className="toc-nav">
        <ul>
          <li><a href="#summary">Executive Summary</a></li>
          {sections.map(section => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
          <li><a href="#deal-breakers-recap">Deal Breakers Recap</a></li>
        </ul>
      </nav>
    </div>
  );
}

function SummaryPage({ sections }: { sections: any[] }) {
  // Import scoring functions dynamically to avoid SSR issues
  const [summaryData, setSummaryData] = React.useState<any>(null);
  
  React.useEffect(() => {
    import('@/lib/pdf/scoring').then(({ extractTopSignals, extractDealBreakers, sectionTrafficLight, sectionScore }) => {
      const topSignals = extractTopSignals(sections);
      const dealBreakers = extractDealBreakers(sections);
      const heatMap = sections.map(s => ({
        title: s.title,
        status: sectionTrafficLight(sectionScore(s))
      }));
      
      setSummaryData({ topSignals, dealBreakers, heatMap });
    });
  }, [sections]);
  
  if (!summaryData) return <div className="page" id="summary"><h1>Loading...</h1></div>;
  
  return (
    <div className="page" id="summary">
      <h1>Executive Summary</h1>
      
      <section className="summary-section">
        <h2>Top 10 Signals</h2>
        <div className="signals-grid">
          {summaryData.topSignals.map((signal: any) => (
            <SignalChip key={signal.id} signal={signal} />
          ))}
        </div>
      </section>

      {summaryData.dealBreakers.length > 0 && (
        <section className="summary-section">
          <h2>Deal Breakers</h2>
          <div className="dealbreakers-callout">
            {summaryData.dealBreakers.map((db: any) => (
              <DealBreakerRibbon key={db.id} text={db.label} />
            ))}
          </div>
        </section>
      )}

      <section className="summary-section">
        <h2>Section Heat Map</h2>
        <HeatMapGrid items={summaryData.heatMap} />
      </section>
    </div>
  );
}

function SignalChip({ signal }: { signal: any }) {
  return (
    <div className="signal-chip">
      <span className="signal-label">{signal.label}</span>
      <span className="signal-value">{formatSignalValue(signal.value)}</span>
    </div>
  );
}

function formatSignalValue(value: any): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return String(value);
}

function HeatMapGrid({ items }: { items: any[] }) {
  return (
    <div className="heatmap-grid">
      {items.map((item, index) => (
        <div key={index} className={`heatmap-item ${item.status}`}>
          <span className="heatmap-title">{item.title}</span>
          <span className="heatmap-status">{item.status}</span>
        </div>
      ))}
    </div>
  );
}

function SectionBlock({ section }: { section: any }) {
  const [takeaways, setTakeaways] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    import('@/lib/pdf/derive-takeaways').then(({ deriveTakeaways }) => {
      setTakeaways(deriveTakeaways(section));
    });
  }, [section]);
  
  const neutralCount = section.answers.filter((a: any) => a.value === 'Neutral').length;
  const showCollapsed = neutralCount > section.answers.length * 0.6;

  return (
    <div className="page section-page" id={section.id}>
      <h2>{section.title}</h2>
      <p className="why-matters">{section.whyItMatters}</p>
      
      {takeaways.length > 0 && (
        <div className="takeaways">
          <h3>Key Takeaways</h3>
          <ul>
            {takeaways.map((takeaway, i) => <li key={i}>{takeaway}</li>)}
          </ul>
        </div>
      )}

      {showCollapsed && (
        <p className="neutral-note">Most responses neutral; outliers highlighted below.</p>
      )}

      <table className="qa-table">
        <thead>
          <tr><th>Question</th><th>Answer</th></tr>
        </thead>
        <tbody>
          {section.answers
            .filter((a: any) => !showCollapsed || a.value !== 'Neutral')
            .map((answer: any) => (
              <tr key={answer.id}>
                <td>{answer.label}</td>
                <td>
                  {typeof answer.value === 'number' && answer.meta?.endpoints ? (
                    <ScaleBar
                      value={answer.value as any}
                      leftLabel={answer.meta.endpoints[0]}
                      rightLabel={answer.meta.endpoints[1]}
                    />
                  ) : (
                    <span>{answer.value}</span>
                  )}
                  {answer.dealBreaker?.isDealBreaker && (
                    <DealBreakerRibbon text={answer.dealBreaker.note || 'Non-negotiable'} />
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function ScaleBar({
  value,
  leftLabel,
  rightLabel
}: {
  value: 1|2|3|4|5;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="scale-bar">
      <div className="scale-labels">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="scale-segments">
        {Array.from({length:5}).map((_,i)=>(
          <div key={i} className={`segment ${i < value ? 'filled' : ''}`} />
        ))}
      </div>
      <div className="scale-value">{value}/5</div>
    </div>
  );
}

function DealBreakerRibbon({ text }: { text: string }) {
  return (
    <div className="dealbreaker-ribbon">
      <span className="icon" aria-hidden="true">!</span>
      <span>Deal Breaker: {text}</span>
    </div>
  );
}

function DealBreakersRecap({ sections }: { sections: any[] }) {
  const [dealBreakers, setDealBreakers] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    import('@/lib/pdf/scoring').then(({ extractDealBreakers }) => {
      setDealBreakers(extractDealBreakers(sections));
    });
  }, [sections]);
  
  if (dealBreakers.length === 0) return null;
  
  return (
    <div className="page" id="deal-breakers-recap">
      <h1>Deal Breakers Recap</h1>
      <div className="dealbreakers-list">
        {dealBreakers.map((db, index) => (
          <div key={index} className="dealbreaker-item">
            <DealBreakerRibbon text={db.label} />
            <p className="dealbreaker-description">
              This is non-negotiable and must be respected in any roommate arrangement.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

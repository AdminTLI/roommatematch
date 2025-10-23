'use client'

import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { useOnboardingStore } from '@/store/onboarding'
import itemsJson from '@/data/item-bank.v1.json'
import type { Item } from '@/types/questionnaire'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileDown, AlertCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const scaleAnchors = {
  agreement: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  comfort: ['Very uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very comfortable'],
}

function humanize(item: Item, value: any): string {
  if (!value) return ''
  switch (item.kind) {
    case 'likert':
      const likertScale = item.scale as 'agreement' | 'frequency' | 'comfort'
      return scaleAnchors[likertScale][value.value - 1] || String(value.value)
    case 'bipolar':
      return `${value.value}/5 (${item.bipolarLabels?.left} ↔ ${item.bipolarLabels?.right})`
    case 'mcq':
      return item.options?.find((o) => o.value === value.value)?.label || value.value
    case 'toggle':
      return value.value ? 'Yes' : 'No'
    case 'timeRange':
      return `${value.start} – ${value.end}`
    case 'number':
      return String(value.value)
  }
}

export default function ReviewClient() {
  const sections = useOnboardingStore((s) => s.sections)
  const allItems = itemsJson as Item[]
  const grouped = useMemo(() => {
    const bySection: Record<string, Item[]> = {}
    for (const it of allItems) {
      bySection[it.section] ??= []
      bySection[it.section].push(it)
    }
    return bySection
  }, [allItems])

  const sectionDescriptions: Record<string, {title: string, description: string, importance: string}> = {
    'location-commute': {
      title: 'Location & Commute',
      description: 'Your preferred living locations and commute preferences.',
      importance: 'Ensures you find housing in convenient areas that match your lifestyle and daily routine.'
    },
    'personality-values': {
      title: 'Personality & Values',
      description: 'Your core personality traits and fundamental values.',
      importance: 'Helps match you with compatible roommates who share similar approaches to life and living together.'
    },
    'sleep-circadian': {
      title: 'Sleep & Circadian Rhythms',
      description: 'Your sleep schedule, quiet hours, and circadian preferences.',
      importance: 'Critical for avoiding conflicts around noise levels and establishing mutually respectful schedules.'
    },
    'noise-sensory': {
      title: 'Noise & Sensory Preferences',
      description: 'Your sensitivity to noise, light, temperature, and environmental factors.',
      importance: 'Ensures comfort in shared spaces by aligning environmental preferences and sensitivities.'
    },
    'home-operations': {
      title: 'Home Operations',
      description: 'Cleanliness standards, chores, and household management preferences.',
      importance: 'Establishes clear expectations for maintaining shared spaces and preventing common roommate conflicts.'
    },
    'social-hosting-language': {
      title: 'Social Life & Hosting',
      description: 'Guest policies, social preferences, and communication language.',
      importance: 'Sets boundaries for social activities and creates a comfortable home environment for all.'
    },
    'communication-conflict': {
      title: 'Communication & Conflict Resolution',
      description: 'How you prefer to communicate and resolve disagreements.',
      importance: 'Foundation for healthy roommate relationships and addressing issues constructively.'
    },
    'privacy-territoriality': {
      title: 'Privacy & Boundaries',
      description: 'Personal space needs and territorial boundaries.',
      importance: 'Respects individual privacy needs while fostering a comfortable shared living arrangement.'
    },
    'reliability-logistics': {
      title: 'Reliability & Logistics',
      description: 'Commitments, financial reliability, and practical living arrangements.',
      importance: 'Ensures all roommates are dependable and aligned on practical living requirements.'
    }
  }

  const downloadPreview = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // ============ COVER PAGE ============
    doc.setFillColor(99, 102, 241) // Indigo
    doc.rect(0, 0, pageWidth, pageHeight, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(36)
    doc.setFont('helvetica', 'bold')
    doc.text('Roommate Agreement', pageWidth / 2, 100, { align: 'center' })
    
    doc.setFontSize(18)
    doc.setFont('helvetica', 'normal')
    doc.text('Compatibility Profile', pageWidth / 2, 120, { align: 'center' })
    
    doc.setFontSize(12)
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    doc.text(today, pageWidth / 2, 250, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text('Generated by Roommate Match', pageWidth / 2, 270, { align: 'center' })
    
    // ============ INTRODUCTION PAGE ============
    doc.addPage()
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('About This Agreement', 20, 30)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const introText = [
      'This Roommate Agreement serves as a comprehensive compatibility profile based on your',
      'responses to our questionnaire. It covers essential aspects of shared living to help ensure',
      'a harmonious and respectful living environment.',
      '',
      'Why These Sections Matter:',
      '',
      'Each section addresses critical factors that impact roommate compatibility. By being',
      'honest and thorough in your responses, you help us match you with compatible roommates',
      'and establish clear expectations from the start.',
      '',
      'Deal Breakers:',
      '',
      'Items marked as "Deal Breakers" represent non-negotiable requirements for you. These are',
      'given special consideration during the matching process to ensure fundamental compatibility.',
      '',
      'Sections Overview:'
    ]
    
    let yPos = 50
    introText.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 6
    })
    
    // Add section summaries
    yPos += 5
    doc.setFontSize(10)
    Object.entries(sectionDescriptions).forEach(([key, info]) => {
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }
      doc.setFont('helvetica', 'bold')
      doc.text(`• ${info.title}:`, 25, yPos)
      doc.setFont('helvetica', 'normal')
      yPos += 5
      doc.text(info.importance, 30, yPos, { maxWidth: 150 })
      yPos += 10
    })
    
    // ============ SECTION PAGES ============
    Object.entries(grouped).forEach(([section, items]) => {
      const answeredItems = items.filter(it => sections[section]?.[it.id])
      if (answeredItems.length === 0) return
      
      doc.addPage()
      
      // Section Header with colored background
      doc.setFillColor(99, 102, 241)
      doc.rect(0, 0, pageWidth, 35, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      const sectionInfo = sectionDescriptions[section] || {
        title: section.replace(/-/g, ' ').toUpperCase(),
        description: ''
      }
      doc.text(sectionInfo.title, 20, 22)
      
      // Section description
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text(sectionInfo.description, 20, 45)
      
      // Separate regular items from deal breakers
      const regularItems = answeredItems.filter(it => !sections[section]?.[it.id]?.dealBreaker)
      const dealBreakerItems = answeredItems.filter(it => sections[section]?.[it.id]?.dealBreaker)
      
      // Set default font for consistency
      doc.setFont('helvetica', 'normal')
      
      // Regular questions table
      if (regularItems.length > 0) {
        const tableData = regularItems.map((it) => {
          const ans = sections[section]?.[it.id]
          return [it.label, humanize(it, ans.value)]
        })
        
        autoTable(doc, {
          startY: 55,
          head: [['Question', 'Your Answer']],
          body: tableData,
          headStyles: {
            fillColor: [99, 102, 241],
            textColor: [255, 255, 255],
            fontSize: 11,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 5
          },
          bodyStyles: {
            fontSize: 10,
            fontStyle: 'normal',
            font: 'helvetica',
            textColor: [31, 41, 55],
            cellPadding: 5,
            lineColor: [229, 231, 235],
            lineWidth: 0.1
          },
          columnStyles: {
            0: { 
              cellWidth: 90, 
              fontStyle: 'normal', 
              fontSize: 10,
              font: 'helvetica'
            },
            1: { 
              cellWidth: 85, 
              fontSize: 10,
              font: 'helvetica',
              fontStyle: 'normal'
            }
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          margin: { left: 20, right: 20 }
        })
      }
      
      // Deal breakers section (if any)
      if (dealBreakerItems.length > 0) {
        const yPos = (doc as any).lastAutoTable?.finalY + 15 || 100
        
        // Deal Breakers Header
        doc.setFillColor(220, 38, 38)
        doc.rect(20, yPos, pageWidth - 40, 8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('⚠ DEAL BREAKERS', 25, yPos + 5.5)
        
        const dbTableData = dealBreakerItems.map((it) => {
          const ans = sections[section]?.[it.id]
          return [it.label, humanize(it, ans.value)]
        })
        
        autoTable(doc, {
          startY: yPos + 10,
          head: [['Question', 'Your Answer']],
          body: dbTableData,
          headStyles: {
            fillColor: [220, 38, 38],
            textColor: [255, 255, 255],
            fontSize: 11,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 5
          },
          bodyStyles: {
            fontSize: 10,
            fontStyle: 'normal',
            font: 'helvetica',
            textColor: [31, 41, 55],
            cellPadding: 5,
            lineColor: [229, 231, 235],
            lineWidth: 0.1
          },
          columnStyles: {
            0: { 
              cellWidth: 90, 
              fontStyle: 'normal', 
              fontSize: 10,
              font: 'helvetica'
            },
            1: { 
              cellWidth: 85, 
              fontSize: 10,
              font: 'helvetica',
              fontStyle: 'normal'
            }
          },
          alternateRowStyles: {
            fillColor: [254, 242, 242]
          },
          margin: { left: 20, right: 20 }
        })
      }
      
      // Footer with page number
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Page ${doc.internal.pages.length - 1}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    })
    
    doc.save('roommate-agreement-preview.pdf')
  }

  const submit = async () => {
    try {
      const response = await fetch('/api/onboarding/submit', { method: 'POST' })
      const result = await response.json()
      
      if (!response.ok) {
        console.error('Submit failed:', result.error)
        // Show the actual error message from API
        alert(`Failed to submit questionnaire: ${result.error || 'Unknown error'}. Please try again.`)
        return
      }
      
      // For demo users, mark completion in localStorage
      if (result.isDemo) {
        localStorage.setItem('demo-questionnaire-completed', 'true')
      }
      
      window.location.href = '/onboarding/complete'
    } catch (error) {
      console.error('Submit error:', error)
      alert(`Failed to submit questionnaire: ${error.message}. Please try again.`)
    }
  }

  return (
    <QuestionnaireLayout
      stepIndex={10}
      totalSteps={11}
      title="Review your answers"
      subtitle="Read-only summary. Submit to finish."
      onPrev={() => (window.location.href = '/onboarding/reliability-logistics')}
      onNext={submit}
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Responses</h2>
            <p className="text-sm text-gray-600 mt-1">Review your answers before submitting. Deal-breakers are highlighted.</p>
          </div>
          <Button onClick={downloadPreview} size="lg">
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {Object.entries(grouped).map(([section, items]) => {
          const answeredItems = items.filter(it => sections[section]?.[it.id])
          if (answeredItems.length === 0) return null
          
          return (
            <div key={section} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {section.replace(/-/g, ' ')}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {answeredItems.length} {answeredItems.length === 1 ? 'response' : 'responses'}
                </p>
              </div>
              
              {/* Questions & Answers */}
              <div className="divide-y divide-gray-100">
                {answeredItems.map((it) => {
                  const ans = sections[section]?.[it.id]
                  return (
                    <div key={it.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-2">{it.label}</p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                              {humanize(it, ans.value)}
                            </span>
                            {ans.dealBreaker && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Deal Breaker
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </QuestionnaireLayout>
  )
}



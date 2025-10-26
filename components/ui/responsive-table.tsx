'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ResponsiveTableColumn {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
  className?: string
  mobilePriority?: boolean // Show on mobile cards
}

interface ResponsiveTableProps {
  columns: ResponsiveTableColumn[]
  data: any[]
  className?: string
  mobileCardTitle?: (row: any) => string
  mobileCardSubtitle?: (row: any) => string
  onRowClick?: (row: any) => void
}

export function ResponsiveTable({
  columns,
  data,
  className,
  mobileCardTitle,
  mobileCardSubtitle,
  onRowClick
}: ResponsiveTableProps) {
  const mobileColumns = columns.filter(col => col.mobilePriority !== false)
  
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "text-left py-3 px-4 font-semibold text-ink-700",
                    column.className
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  "border-b border-line hover:bg-surface-1 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "py-3 px-4 text-ink-600",
                      column.className
                    )}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <Card
            key={index}
            className={cn(
              "border border-line hover:shadow-md transition-shadow",
              onRowClick && "cursor-pointer"
            )}
            onClick={() => onRowClick?.(row)}
          >
            <CardHeader className="pb-3">
              {mobileCardTitle && (
                <CardTitle className="text-lg text-ink-900">
                  {mobileCardTitle(row)}
                </CardTitle>
              )}
              {mobileCardSubtitle && (
                <p className="text-sm text-ink-600">
                  {mobileCardSubtitle(row)}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {mobileColumns.map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-ink-700 min-w-0 flex-1">
                    {column.label}:
                  </span>
                  <div className="text-sm text-ink-600 text-right min-w-0 flex-1 ml-2">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Example usage component for demonstration
export function ExampleResponsiveTable() {
  const columns: ResponsiveTableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      mobilePriority: true,
      render: (value) => <span className="font-semibold">{value}</span>
    },
    {
      key: 'university',
      label: 'University',
      mobilePriority: true,
      render: (value) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: 'compatibility',
      label: 'Compatibility',
      mobilePriority: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-brand-600">{value}%</span>
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-brand-600 h-2 rounded-full" 
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      mobilePriority: false,
      render: (value) => (
        <Badge variant={value === 'Active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      mobilePriority: true,
      render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            View
          </Button>
          <Button size="sm">
            Chat
          </Button>
        </div>
      )
    }
  ]

  const data = [
    {
      name: 'Emma Johnson',
      university: 'TU Delft',
      compatibility: 94,
      status: 'Active'
    },
    {
      name: 'Lucas van der Berg',
      university: 'University of Amsterdam',
      compatibility: 89,
      status: 'Active'
    },
    {
      name: 'Sophie de Vries',
      university: 'Erasmus University',
      compatibility: 76,
      status: 'Pending'
    }
  ]

  return (
    <ResponsiveTable
      columns={columns}
      data={data}
      mobileCardTitle={(row) => row.name}
      mobileCardSubtitle={(row) => `${row.university} • ${row.compatibility}% match`}
      onRowClick={(row) => console.log('Row clicked:', row)}
    />
  )
}

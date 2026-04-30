'use client'

import { Fragment, ReactNode, useState } from 'react'
import { Button, Skeleton } from '@components/ui'
import { ChevronRight } from 'lucide-react'

interface Column<T> {
  header: string
  render: (item: T) => ReactNode
}

interface DataTableProps<T> {
  data?: T[] | null
  columns: Column<T>[]
  isLoading?: boolean
  renderExpansion?: (item: T) => ReactNode
  emptyMessage?: string
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No data found.',
  renderExpansion,
}: DataTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => (prev === id ? null : id))
  }
  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center border rounded-xl">{emptyMessage}</div>
    )
  }

  return (
    <div className="border-2 border-border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent-1 border-b border-border">
              {renderExpansion && <th className="w-10 px-4" />}
              {columns.map((col, i) => (
                <th key={i} className="px-3 py-2 font-semibold text-sm">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const expansionId = `expansion-row-${item.id}`

              return (
                <Fragment key={item.id}>
                  <tr className="hover:bg-accent-2 transition-colors">
                    {renderExpansion && (
                      <td className="">
                        <Button
                          variant="naked"
                          type="button"
                          aria-label="Toggle row details"
                          aria-expanded={expandedRows === item.id}
                          aria-controls={expansionId}
                          onClick={() => toggleRow(item.id)}
                        >
                          <ChevronRight
                            size={16}
                            className={
                              expandedRows === item.id ? 'rotate-90' : ''
                            }
                          />
                        </Button>
                      </td>
                    )}
                    {columns.map((col, i) => (
                      <td key={i} data-testid={`cell-${item.id}-${i}`} className={'px-2 py-1 text-sm text-center'}>
                        {col.render(item)}
                      </td>
                    ))}
                  </tr>
                  {expandedRows === item.id && renderExpansion && (
                    <tr>
                      <td
                        id={expansionId}
                        colSpan={columns.length + 1}
                        className="bg-accent-1 p-0"
                      >
                        {renderExpansion(item)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

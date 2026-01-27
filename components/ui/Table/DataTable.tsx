'use client'

import { Fragment, ReactNode, useState } from 'react'
import { Button, Skeleton } from '@components/ui'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Column<T> {
  header: string
  render: (item: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
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
                <th key={i} className="p-4 font-semibold text-sm">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <Fragment key={item.id}>
                <tr className="hover:bg-accent-2 transition-colors">
                  {renderExpansion && (
                    <td className="px-4">
                      <Button
                        variant="naked"
                        onClick={() => toggleRow(item.id)}
                      >
                        {expandedRows === item.id ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </Button>
                    </td>
                  )}
                  {columns.map((col, i) => (
                    <td key={i} className={'px-2 py-1 text-sm text-center'}>
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
                {expandedRows === item.id && renderExpansion && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="bg-accent-1 p-0"
                    >
                      {renderExpansion(item)}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

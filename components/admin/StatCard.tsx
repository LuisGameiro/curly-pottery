import { Container, Text } from '@components/ui'
import { ReactNode } from 'react'

interface StatCardProp {
  label: string
  value: number
  icon: ReactNode
  trend?: string
  isCritical?: boolean
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  isCritical,
}: StatCardProp) {
  return (
    <Container
      variant="box"
      data-testid={'stat-card-' + label.toLowerCase().replace(/\s+/g, '-')}
      className={` ${isCritical ? 'border-red/60 ' : ''}`}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-4 mb-4 ">
          <div className="rounded-lg">{icon}</div>
          <Text variant="bold">{label}</Text>
        </div>
        {trend && (
          <span
            className={`font-bold px-2 py-0.5 rounded-full ${isCritical ? 'text-red' : ' text-green'}`}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="flex justify-center items-center">
        <Text className="sectionHeading">{value}</Text>
      </div>
    </Container>
  )
}

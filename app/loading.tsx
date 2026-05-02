import { LoadingDots } from '@components/ui'
import { Text } from '@components/ui'

export default function Loading() {
  return (
    <div className="space-y-10 text-center bg-linear-to-r from-background to-accent-2 py-20">
      <LoadingDots />
      <Text variant="sectionHeading" className="ml-2">
        Loading
      </Text>
    </div>
  )
}

import { Skeleton } from '@components/ui'

export default function ProductsLoading() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 4xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i}>
          <div className="w-full aspect-square" />
        </Skeleton>
      ))}
    </div>
  )
}

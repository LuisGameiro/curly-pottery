import { Skeleton } from "@components/ui";

export default function ProductsLoading() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i}>
          <div className="w-1/3 min-h-24 xl:min-h-60 sm:min-h-40" />
        </Skeleton>
      ))}
    </div>
  );
}

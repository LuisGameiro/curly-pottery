import { Skeleton } from "@components/ui";

export default function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i}>
          <div className="w-full h-64" />
        </Skeleton>
      ))}
    </div>
  );
}

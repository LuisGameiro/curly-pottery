export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber/20 text-amber border-amber/60',
    PAID: 'bg-secondary/20 text-secondary border-secondary/60',
    SHIPPED: 'bg-purple-100 text-purple-700 border-purple-300',
    COMPLETED: 'bg-green/20 text-green border-green/60',
    DELIVERED: 'bg-green/20 text-green border-green/60',
    CANCELLED: 'bg-red/20 text-red border-red/60',
  }

  return (
    <span
      data-testid={'status-badge-' + status.toLowerCase()}
      className={`font-bold px-1 rounded-full border ${styles[status] || styles.PENDING}`}
    >
      {status}
    </span>
  )
}

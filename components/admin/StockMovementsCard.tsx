import { Container, Text } from '@components/ui'
import { StockMovementItem } from '@actions/dashboard.actions'
import { ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react'

export function StockMovementsCard({
  movements,
}: {
  movements: StockMovementItem[]
}) {
  return (
    <Container variant="box" data-testid="stock-movements-card">
      <div className="flex items-center gap-4 mb-4">
        <History className="text-muted" size={20} />
        <Text variant="bold">Recent Stock Movements</Text>
        <span className="ml-auto text-xs text-muted">
          Last {movements.length} entries
        </span>
      </div>

      {movements.length === 0 ? (
        <p className="text-sm text-muted">No stock movements recorded yet.</p>
      ) : (
        <ul className="divide-y divide-border text-sm max-h-96 overflow-y-auto">
          {movements.map((movement) => (
            <li key={movement.id} className="flex items-center gap-3 py-2">
              {movement.quantity < 0 ? (
                <ArrowDownCircle size={16} className="text-red shrink-0" />
              ) : (
                <ArrowUpCircle size={16} className="text-green shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">
                  {movement.variant?.product?.name ?? 'Unknown product'}
                </div>
                <div className="text-xs text-muted">
                  {movement.variant?.sku ?? ''}
                  {movement.variant
                    ? ` — ${movement.variant.colorName} / ${movement.variant.sizeName}`
                    : ''}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className={
                    movement.quantity < 0
                      ? 'text-red font-bold'
                      : 'text-green font-bold'
                  }
                >
                  {movement.quantity > 0 ? '+' : ''}
                  {movement.quantity}
                </div>
                <div className="text-xs text-muted">
                  {new Date(movement.createdAt).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}

import { Button, Text } from '@components/ui'
import { cn } from '@lib/utils'
import { useFormContext } from 'react-hook-form'

const shippingOptions = [
  {
    method: 'standard',
    conditions: 'Standard Delivery (3-5 days)',
    price: 0,
  },
  {
    method: 'express',
    conditions: 'Next Day Delivery',
    price: 5.99,
  },
]

interface ShippingMethodProps {
  onComplete: () => void
}

export default function ShippingMethod({ onComplete }: ShippingMethodProps) {
  const { setValue, watch } = useFormContext()
  const selectedMethod = watch('shippingMethod')

  return (
    <div className="space-y-6">
      <Text variant="sectionHeading">Select Shipping</Text>

      <div className="space-y-3">
        {shippingOptions.map((o) => {
          const isSelected = selectedMethod === o.method
          return (
            <button
              key={o.method}
              type="button"
              onClick={() => {
                setValue('shippingPrice', o.price)
                setValue('shippingMethod', o.method)
              }}
              className={cn(
                'w-full flex justify-between items-center p-4 border rounded-lg transition-all duration-200 text-left',
                isSelected
                  ? 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                  : 'border-border hover:border-secondary/40 hover:bg-accent/5',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border flex items-center justify-center',
                    isSelected ? 'border-secondary' : 'border-muted',
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                  )}
                </div>
                <Text
                  variant="bold"
                  className={isSelected ? 'text-secondary' : ''}
                >
                  {o.conditions}
                </Text>
              </div>
              <Text
                className={cn(
                  'font-bold',
                  o.price === 0
                    ? 'text-green'
                    : isSelected
                      ? 'text-secondary'
                      : '',
                )}
              >
                {o.price === 0 ? 'FREE' : `£${o.price.toFixed(2)}`}
              </Text>
            </button>
          )
        })}
      </div>

      <div className="pt-4">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={!selectedMethod}
          onClick={onComplete}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}

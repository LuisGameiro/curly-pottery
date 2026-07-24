import { Button, Text } from '@components/ui'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

interface ShippingMethodProps {
  onComplete: () => void
}

export default function ShippingMethod({ onComplete }: ShippingMethodProps) {
  const { setValue } = useFormContext()

  useEffect(() => {
    setValue('shippingPrice', 5.95)
    setValue('shippingMethod', 'standard')
  }, [setValue])

  return (
    <div className="space-y-6" data-testid="shipping-method-selector">
      <Text variant="sectionHeading">Shipping Method</Text>

      <div className="space-y-3">
        <div className="w-full flex justify-between items-center p-4 border border-secondary bg-secondary/5 ring-1 ring-secondary rounded-lg text-left">
          <div className="flex items-center gap-3">
            <Text variant="bold" className="text-secondary">
              Standard Tracked Delivery (4-5 working days)
            </Text>
          </div>
          <Text className="font-bold text-secondary">£5.95</Text>
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={onComplete}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}

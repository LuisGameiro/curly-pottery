import { Minus, Plus } from 'lucide-react'
import React from 'react'

export interface QuantityProps {
  value: number
  increase: () => void
  decrease: () => void
  handleChange: React.ChangeEventHandler<HTMLInputElement>
  max?: number
}

const Quantity = ({
  value,
  increase,
  decrease,
  handleChange,
  max = 6,
}: QuantityProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border border-border rounded-md bg-background overflow-hidden h-8">
        <button
          type="button"
          onClick={decrease}
          disabled={value <= 1}
          className="px-2 h-full flex-center hover:bg-accent-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-r border-border"
          aria-label="Decrease quantity"
        >
          <Minus width={14} height={14} />
        </button>

        <input
          className="w-10 text-center text-sm font-medium bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          onChange={(e) => {
            const val = Number(e.target.value)
            if (val >= 0 && val <= max) handleChange(e)
          }}
          value={value}
          type="number"
          readOnly
        />

        <button
          type="button"
          onClick={increase}
          disabled={value >= max}
          className="px-2 h-full flex-center hover:bg-accent-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-l border-border"
          aria-label="Increase quantity"
        >
          <Plus width={14} height={14} />
        </button>
      </div>
    </div>
  )
}

export default Quantity

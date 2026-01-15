import React, { FC } from "react";
import { Cross, Plus, Minus } from "@components/icons";
import cn from "clsx";

export interface QuantityProps {
  value: number;
  increase: () => any;
  decrease: () => any;
  handleRemove: React.MouseEventHandler<HTMLButtonElement>;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  max?: number;
}

const Quantity: FC<QuantityProps> = ({
  value,
  increase,
  decrease,
  handleChange,
  max = 6,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* QUANTITY SELECTOR GROUP */}
      <div className="flex items-center border border-accent-2 rounded-md bg-accent-0 overflow-hidden h-8">
        <button
          type="button"
          onClick={decrease}
          disabled={value <= 1}
          className="px-2 h-full flex items-center justify-center hover:bg-accent-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-r border-accent-2"
          aria-label="Decrease quantity"
        >
          <Minus width={14} height={14} />
        </button>

        <input
          className="w-10 text-center text-sm font-medium bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= 0 && val <= max) handleChange(e);
          }}
          value={value}
          type="number"
          readOnly
        />

        <button
          type="button"
          onClick={increase}
          disabled={value >= max}
          className="px-2 h-full flex items-center justify-center hover:bg-accent-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-l border-accent-2"
          aria-label="Increase quantity"
        >
          <Plus width={14} height={14} />
        </button>
      </div>
    </div>
  );
};

export default Quantity;
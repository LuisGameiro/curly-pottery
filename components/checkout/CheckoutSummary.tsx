"use client";

export function CheckoutSummary({ items = [], total, tax = 0, shipping = 0 }: any) {
  return (
    <div className="bg-accent-1 p-6 rounded-xl border border-accent-2 sticky top-4">
      <h2 className="text-lg font-bold mb-4">Order Summary</h2>
      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-accent-7">{item.quantity}x {item.name}</span>
            <span className="font-medium">£{item.variant.price * item.quantity}</span>
          </div>
        ))}
        <hr className="border-accent-2" />
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>£{total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Taxes</span>
          <span className="text-green-600 font-medium">
            {tax === 0 ? "Included" : `£${tax}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span className="text-green-600 font-medium">
            {shipping === 0 ? "FREE" : `£${shipping}`}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-3 border-t border-accent-2">
          <span>Total</span>
          <span>£{total + shipping}</span>
        </div>
      </div>
    </div>
  );
}
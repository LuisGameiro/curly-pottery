import { Text } from "@components/ui";

export default function ShippingMethod({ onComplete }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Select Shipping</h2>
      <button 
        onClick={() => onComplete({shipping:{ method: "express", price: 5.99 }})}
        className="w-full p-4 border rounded-lg flex justify-between hover:border-black"
      >
        <span>Standard Delivery (3-5 days)</span>
        <span className="font-bold text-green-600">FREE</span>
      </button>
      <button 
        onClick={() => onComplete({shipping:{ method: "express", price: 5.99 }})}
        className="w-full p-4 border rounded-lg flex justify-between hover:border-black"
      >
        <span>Next Day Delivery</span>
        <span className="font-bold">£5.99</span>
      </button>
      <Text>Currently we only ship for uk, if you are outside the uk please contact us directly for us to try to help you how to send you the required products.</Text>
    </div>
  );
}
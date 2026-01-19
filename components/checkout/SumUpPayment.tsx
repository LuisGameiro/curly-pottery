import Script from "next/script";
import { Text } from "@components/ui";

interface SumUpResponse {
  status: "PAID" | "PENDING" | "FAILED" | "EXPIRED";
  id: string;
  transaction_code?: string;
  amount: number;
  currency: string;
}
declare global {
  interface Window {
    SumUpCard: { mount: (options: { id: string; checkoutId: string; onResponse: (type: string, body: SumUpResponse) => void }) => void };
  }
}
export default function SumUpPayment({ checkoutId }: { checkoutId: string }) {
  const mountSumUp = () => {
    window.SumUpCard.mount({
      id: "sumup-card",
      checkoutId: checkoutId,
      onResponse: function (type: string, body: SumUpResponse) {
        if (type === "success" || body.status === "PAID") {
          window.location.href = "/checkout/success";
        }
      },
    });
  };

  return (
    <div className="space-y-8">
      <Text variant="sectionHeading">Finalize Payment</Text>
      <Script
        className="bg-background"
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
        onLoad={mountSumUp}
      />
      <div
        id="sumup-card"
        className="border p-4 rounded-xl bg-accent-1 min-h-[250px]"
      />
    </div>
  );
}

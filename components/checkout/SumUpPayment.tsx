import Script from "next/script";

export default function SumUpPayment({ checkoutId }: { checkoutId: string }) {
  const mountSumUp = () => {
    // @ts-ignore
    window.SumUpCard.mount({
      id: "sumup-card",
      checkoutId: checkoutId,
      onResponse: function (type: string, body: any) {
        if (type === "success" || body.status === "PAID") {
          window.location.href = "/checkout/success";
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Finalize Payment</h2>
      <Script 
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js" 
        onLoad={mountSumUp}
      />
      <div id="sumup-card" className="border p-4 rounded-xl bg-accent-1 min-h-[250px]" />
    </div>
  );
}
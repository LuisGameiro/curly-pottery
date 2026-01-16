"use client";

import Script from "next/script";
import { useState } from "react";
import { Text } from "@components/ui";

declare global {
  interface Window {
    SumUpCard: {
      mount: (options: any) => void;
    };
  }
}

export default function SumUpPayment({ checkoutId }: {
  checkoutId: string;
}) {
  const [loading, setLoading] = useState(true);

  const mountWidget = () => {
    if (window.SumUpCard) {
      window.SumUpCard.mount({
        id: "sumup-card",
        checkoutId: checkoutId,
        onResponse: function (type: string, body: any) {
          console.log("SumUp Response:", type, body);
          if (type === "success") {
            window.location.href = "/checkout/success";
          }
        },
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Text variant="sectionHeading">Payment Details</Text>

      <Script
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
        onLoad={mountWidget}
      />

      <div id="sumup-card" className="min-h-[200px]">
        {loading && (
          <div className="animate-pulse bg-accent-1 h-40 rounded-lg" />
        )}
      </div>
    </div>
  );
}

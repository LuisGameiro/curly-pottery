"use server"

import { authOptions } from "@lib/auth/authOptions";
import { getServerSession } from "next-auth";

export async function createSumUpCheckout(amount: number, cartId: string) {
  const session = await getServerSession(authOptions);
  
  // Use user email from session, or fallback for guest
  const userEmail = session?.user?.email || "guest@example.com";

  try {
    const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SUMUP_API}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: `ORDER-${cartId}-${Date.now()}`,
        amount: amount,
        currency: "GBP",
        merchant_code: process.env.SUMUP_MERCHANT_CODE,
        pay_to_email: userEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "SumUp API error");
    }

    return { checkoutId: data.id };
  } catch (error) {
    console.error("SumUp Action Error:", error);
    return { error: "Could not initialize payment" };
  }
}
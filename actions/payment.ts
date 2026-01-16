"use server";

import { authOptions } from "@lib/auth/authOptions";
import { ActionResponse } from "@lib/types/utils";
import { getServerSession } from "next-auth";

export async function createSumUpCheckout(amount: number, cartId: string): Promise<ActionResponse<string | null>> {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email

    const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUMUP_API}`,
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

    return {
      success: true,
      message: "Fecthed Category successfully",
      data: data.id,
    };
  } catch (error) {
    console.error("getCategoryById_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

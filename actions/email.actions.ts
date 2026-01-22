"use server";

import { ActionResponse } from "@lib/types/types";
import { ReactNode } from "react";
import { CreateEmailResponseSuccess, Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  body,
  from = "noreply@curlypottery.com",
}: {
  to: string;
  subject: string;
  body: ReactNode;
  from?: string;
}): Promise<ActionResponse<CreateEmailResponseSuccess>> {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react: body,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Email sent successfully!",
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to send email",
      errors: error,
    };
  }
}

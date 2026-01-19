"use client";

import { useId, useState } from "react";
import InformationForm from "@components/checkout/InformationForm";
import ShippingMethod from "@components/checkout/ShippingMethod";
import SumUpPayment from "@components/checkout/SumUpPayment";
import { CheckoutSummary } from "@components/checkout/CheckoutSummary";
import useCart from "@lib/hooks/useCart";
import { createSumUpCheckout } from "actions/sumUpPayment.actions";
import { createOrder } from "actions/order.actions";
import { Container } from "@components/ui";
import { toast } from "sonner";
import { InputAddress } from "@lib/types/types";
import { useUser } from "@lib/hooks/useUser";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'Checkout - Curly Pottery',
  description: 'Complete your purchase at Curly Pottery by providing your shipping information, selecting a shipping method, and making a secure payment. Enjoy a seamless shopping experience with us.',
};

export type FormDataCheckout = {
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  postcode: string;
  city: string;
  shippingPrice: number;
  shippingMethod: string;
  email: string;
  phone: string;
  taxes?: number;
};

export default function CheckoutPage() {
  const { data } = useCart();
  const { user, isAuthenticated } = useUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataCheckout>({
    firstName: "",
    lastName: "",
    address: "",
    country: "",
    postcode: "",
    city: "",
    email: "",
    phone: "",
    shippingPrice: 0,
    shippingMethod: "",
    taxes: 0,
  });
  const [checkoutId, setCheckoutId] = useState("");
  const [loading, setLoading] = useState(false);
  const cartId = useId();

  if (data.lineItems.length === 0) redirect("/cart");

  const nextToShipping = (data: FormData) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const nextToPayment = async (
    shippingPrice: number,
    shippingMethod: string,
    taxes: number = 0,
  ) => {
    setLoading(true);
    setFormData((prev) => ({ ...prev, shippingPrice, shippingMethod, taxes }));

    const address: InputAddress = {
      address: formData.address,
      postalCode: formData.postcode,
      city: formData.city,
      country: formData.country || "United Kingdom",
      userId: user?.id || "",
    };

    try {
      const response = await createSumUpCheckout(
        data.subtotalPrice + shippingPrice,
        cartId,
      );

      if (!response.success && !response.data) {
        setLoading(false);
        return toast(response.message);
      } else setCheckoutId(response.data ?? "");

      await createOrder({
        userId: user?.id,

        email: formData.email,
        phone: formData.phone,
        lastName: formData.lastName,
        firstName: formData.firstName,
        address,

        lineItems: data.lineItems,
        discounts: [],
        subtotalPrice: data.subtotalPrice,
        totalPrice: data.subtotalPrice + shippingPrice + taxes,
        currency: "GBP",

        shippingPrice,
        shippingMethod,
        taxes: 0,
      });

      setStep(3);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = (goStep: number) => {
    console.log(goStep);
    if (step > goStep) setStep(goStep);
  };

  return (
    <Container className="lg:max-w-5xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8">
        <div className="flex items-center gap-4 mb-8 text-sm font-medium">
          <button
            className={
              step >= 1
                ? "text-secondary hover:text-secondary/60 cursor-pointer"
                : "text-accent-4"
            }
            onClick={() => goBack(1)}
            disabled={loading}
          >
            Info
          </button>
          <div className="h-px w-8 bg-accent-2" />
          <button
            className={
              step >= 2
                ? "text-secondary hover:text-secondary/60 cursor-pointer"
                : "text-accent-4"
            }
            onClick={() => goBack(2)}
            disabled={loading}
          >
            Shipping
          </button>
          <div className="h-px w-8 bg-accent-2" />
          <button
            className={
              step >= 3
                ? "text-secondary hover:text-secondary/60 cursor-pointer"
                : "text-accent-4"
            }
            onClick={() => goBack(3)}
            disabled={loading}
          >
            Payment
          </button>
        </div>

        {step === 1 && (
          <InformationForm
            userId={user?.id}
            onComplete={nextToShipping}
            isLoggedIn={isAuthenticated}
          />
        )}
        {step === 2 && <ShippingMethod onComplete={nextToPayment} />}
        {step === 3 && <SumUpPayment checkoutId={checkoutId} />}
      </div>

      <div className="lg:col-span-4">
        <CheckoutSummary
          items={data.lineItems}
          total={data.subtotalPrice}
          tax={0}
          shipping={formData?.shippingPrice}
        />
      </div>
    </Container>
  );
}

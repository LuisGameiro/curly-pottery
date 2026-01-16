"use client";

import { useId, useState } from "react";
import { useSession } from "next-auth/react";
import InformationForm from "@components/checkout/InformationForm";
import ShippingMethod from "@components/checkout/ShippingMethod";
import SumUpPayment from "@components/checkout/SumUpPayment";
import { CheckoutSummary } from "@components/checkout/CheckoutSummary";
import useCart from "@lib/hooks/useCart";
import { createSumUpCheckout } from "actions/payment";
import { createOrder } from "actions/order.actions";
import { useRouter } from "next/navigation";
import { Container } from "@components/ui";

type FormData = {
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  postcode: string;
  city: string;
  shipping: any;
  email: string;
  phone: string;
};

export default function CheckoutPage() {
  const { data } = useCart();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [checkoutId, setCheckoutId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const cartId = useId();

  if (data.lineItems.length === 0) router.replace("/cart");

  const nextToShipping = (data: any) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const nextToPayment = async (shippingData: any) => {
    setLoading(true);
    setFormData({ ...formData, shipping: shippingData });
    const address = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      postalCode: formData.postcode,
      city: formData.city,
      country: formData.country || "United Kingdom",
    };
    try {
      const result = await createSumUpCheckout(
        data.subtotalPrice + shippingData.shipping?.price,
        cartId,
      );

      if (result.error) {
        alert(result.error);
        setLoading(false);
        return;
      }
      setCheckoutId(result.checkoutId);

      const result2 = await createOrder({
        cartId,
        userId: session?.user?.id,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: address,
        billingAddress: address,
        cart: data,
        ...shippingData,
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
          <span
            className={
              step >= 1
                ? "text-secondary hover:text-secondary/60 cursor-pointer"
                : "text-accent-4"
            }
            onClick={() => goBack(1)}
          >
            Info
          </span>
          <div className="h-px w-8 bg-accent-2" />
          <span
            className={
              step >= 2
                ? "text-secondary hover:text-secondary/60 cursor-pointer"
                : "text-accent-4"
            }
            onClick={() => goBack(2)}
          >
            Shipping
          </span>
          <div className="h-px w-8 bg-accent-2" />
          <span
            className={
              step >= 3
                ? "text-secondary hover:text-secondary/60 cursor-pointer"
                : "text-accent-4"
            }
            onClick={() => goBack(3)}
          >
            Payment
          </span>
        </div>

        {step === 1 && (
          <InformationForm
            initialData={session?.user}
            onComplete={nextToShipping}
            isLoggedIn={session?.user}
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
          shipping={formData?.shipping?.price}
        />
      </div>
    </Container>
  );
}

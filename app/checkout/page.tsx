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
import { Address } from "@lib/types/customer";
import { redirect } from "next/dist/server/api-utils";

type FormData = {
    firstName: string,
    lastName: string
    address: string
    country: string
    postalCode: string
    city: string

}

export default function CheckoutPage() {
    const { data } = useCart()
    const { data: session, status } = useSession();
    const [step, setStep] = useState(1); // 1: Info, 2: Shipping, 3: Payment
    const [formData, setFormData] = useState<FormData>({});
    const [checkoutId, setCheckoutId] = useState("");
    const [loading, setLoading] = useState(false);
    const cartId = useId()

    if (data.lineItems.length===0)
        redirect('/cart')
    
    const nextToShipping = (data: any) => {
        setFormData({ ...formData, ...data });
        setStep(2);
    };

    const nextToPayment = async (shippingData: any) => {
        setLoading(true);
        setFormData({ ...formData, ...shippingData });
        const address = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            postalCode: formData.postalCode,
            city: formData.city,
            country: formData.country || 'UK',
        }
        const result = await createSumUpCheckout(data.subtotalPrice + shippingData.shipping?.price, cartId);

        if (result.error) {
            alert(result.error);
            setLoading(false);
            return;
        }
        const result2 = await createOrder({
            cartId,

            shippingAddress: address,
            billingAddress: address,
            cart:data

        });

        setCheckoutId(result.checkoutId);
        setStep(3);
        setLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
                {/* Progress Header */}
                <div className="flex items-center gap-4 mb-8 text-sm font-medium">
                    <span className={step >= 1 ? "text-primary" : "text-accent-4"}>Info</span>
                    <div className="h-px w-8 bg-accent-2" />
                    <span className={step >= 2 ? "text-primary" : "text-accent-4"}>Shipping</span>
                    <div className="h-px w-8 bg-accent-2" />
                    <span className={step >= 3 ? "text-primary" : "text-accent-4"}>Payment</span>
                </div>

                {/* Dynamic Steps */}
                {step === 1 && (
                    <InformationForm
                        initialData={session?.user}
                        onComplete={nextToShipping}
                        isGuest={!session}
                    />
                )}
                {step === 2 && <ShippingMethod onComplete={nextToPayment} />}
                {step === 3 && <SumUpPayment checkoutId={checkoutId} />}
            </div>

            <div className="lg:col-span-4">
                <CheckoutSummary items={data.lineItems} total={data.subtotalPrice} tax={0} shipping={formData?.shipping?.price} />
            </div>
        </div>
    );
}
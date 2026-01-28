'use client'

import { useId, useState } from 'react'
import InformationForm from '@components/checkout/InformationForm'
import ShippingMethod from '@components/checkout/ShippingMethod'
import SumUpPayment from '@components/checkout/SumUpPayment'
import { CheckoutSummary } from '@components/checkout/CheckoutSummary'
import useCart from '@lib/hooks/useCart'
import { createSumUpCheckout } from 'actions/sumUpPayment.actions'
import { createOrder } from 'actions/order.actions'
import { Container } from '@components/ui'
import { toast } from 'sonner'
import { CreateOrder, CurrencyCode } from '@lib/types/types'
import { useUser } from '@lib/hooks/useUser'
import { redirect } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { sendEmail } from 'actions/email.actions'
import { ClientOrderEmail } from '@lib/emails/ClientOrderEmail'
import { showCurrency } from '@lib/calculate-price'
import { AdminOrderEmail } from '@lib/emails/AdminOrderEmail'
import { trackEvent } from '@lib/analytics/trackEvents'

export default function CheckouClient() {
  const { data, deleteAll } = useCart()
  const { user, isAuthenticated } = useUser()
  const [step, setStep] = useState(1)
  const [checkoutId, setCheckoutId] = useState('')
  const [loading, setLoading] = useState(false)
  const cartId = useId()

  const methods = useForm<CreateOrder>({
    defaultValues: {
      userId: user?.id || '',
      email: user?.email || '',
      currency: data?.currency || CurrencyCode.GBP,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      lineItems: data.lineItems ?? [],
      subtotalPrice: data.subtotalPrice,
      totalPrice: data.totalPrice,
      shippingMethod: '',
      shippingPrice: 0,
      taxes: 0,
    },
  })

  if (!data || data.lineItems.length === 0) {
    return redirect('/cart')
  }
  const { watch } = methods
  const currentValues = watch()

  trackEvent('begin_checkout', {
    userId: currentValues?.userId,
    total_value: currentValues.totalPrice,
    currency: currentValues.currency,
    item_count: currentValues.lineItems.length,
    items: currentValues.lineItems.map(
      (item) => item.quantity + ' * ' + item.sku,
    ),
  })

  const onInformationSubmit = () => setStep(2)

  const nextToPayment = async () => {
    try {
      setLoading(true)
      const response = await createSumUpCheckout(
        currentValues.totalPrice,
        cartId,
      )
      trackEvent('before_purchase', {
        transaction_id: response.data,
        userId: currentValues?.userId,
        total_value: currentValues.totalPrice,
        currency: currentValues.currency,
        item_count: currentValues.lineItems.length,
        items: currentValues.lineItems.map(
          (item) => item.quantity + ' * ' + item.sku,
        ),
      })
      if (!response.success && !response.data) {
        setLoading(false)
        toast(response.message)
      } else {
        setCheckoutId(response.data || '')
        setStep(3)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const onPaymentComplete = async () => {
    let red = false
    try {
      setLoading(true)

      const orderResponse = await createOrder(currentValues)

      if (!orderResponse.success) {
        toast.error(orderResponse.message)
      } else {
        red = true
        await sendEmail({
          to: currentValues.email,
          subject: 'Order Confirmation',
          body: ClientOrderEmail({
            customerName: currentValues.firstName,
            orderId: orderResponse.data?.id || '',
            totalAmount: `${showCurrency[currentValues.currency]} ${currentValues.totalPrice.toFixed(2)}`,
          }),
        })
        await sendEmail({
          to: currentValues.email,
          subject: 'Order Confirmation',
          body: AdminOrderEmail({
            customerEmail: currentValues.email,
            orderId: orderResponse.data?.id || '',
            itemsCount: currentValues.lineItems.length || 0,
          }),
        })
        trackEvent('purchase_complete', {
          order_id: orderResponse.data?.id,
          transaction_id: checkoutId,
          userId: currentValues?.userId,
          total_value: currentValues.totalPrice,
          currency: currentValues.currency,
          item_count: currentValues.lineItems.length,
          items: currentValues.lineItems.map(
            (item) => item.quantity + ' * ' + item.sku,
          ),
        })

        deleteAll()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
    if (red) redirect('/checkout/success')
  }

  const goBack = (goStep: number) => {
    console.error(goStep)
    if (step > goStep) setStep(goStep)
  }

  return (
    <FormProvider {...methods}>
      <Container className="lg:max-w-5xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-4 mb-8 text-sm font-medium">
            <button
              className={
                step >= 1
                  ? 'text-secondary hover:text-secondary/60 cursor-pointer'
                  : 'text-muted'
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
                  ? 'text-secondary hover:text-secondary/60 cursor-pointer'
                  : 'text-muted'
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
                  ? 'text-secondary hover:text-secondary/60 cursor-pointer'
                  : 'text-muted'
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
              onComplete={onInformationSubmit}
              isLoggedIn={isAuthenticated}
            />
          )}
          {step === 2 && <ShippingMethod onComplete={nextToPayment} />}
          {step === 3 && (
            <SumUpPayment
              checkoutId={checkoutId}
              onComplete={onPaymentComplete}
            />
          )}
        </div>

        <div className="lg:col-span-4">
          <CheckoutSummary />
        </div>
      </Container>
    </FormProvider>
  )
}

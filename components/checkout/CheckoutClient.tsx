'use client'

import { useState, useEffect } from 'react'
import InformationForm from '@components/checkout/InformationForm'
import SumUpPayment from '@components/checkout/SumUpPayment'
import { CheckoutSummary } from '@components/checkout/CheckoutSummary'
import useCart from '@lib/hooks/useCart'
import { createSumUpCheckout } from '@actions/sumUpPayment.actions'
import { createOrder } from '@actions/order.actions'
import { Container, Text, Button, Input } from '@components/ui'
import { toast } from 'sonner'
import { CreateOrder, CurrencyCode } from '@lib/types/types'
import { useUser } from '@lib/hooks/useUser'
import { redirect } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { sendEmail } from '@actions/email.actions'
import { ClientOrderEmail } from '@lib/emails/ClientOrderEmail'
import { showCurrency } from '@lib/calculate-price'
import { AdminOrderEmail } from '@lib/emails/AdminOrderEmail'
import { trackEvent } from '@lib/analytics/trackEvents'
import { updateCartPrice } from '@actions/cart.actions'
import * as Sentry from '@sentry/nextjs'

export default function CheckoutClient() {
  const { data, deleteAll } = useCart()
  const { user, isAuthenticated } = useUser()
  const [step, setStep] = useState(1)
  const [checkoutId, setCheckoutId] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentProvider, setPaymentProvider] = useState<
    'sumup' | 'klarna' | 'googlepay'
  >('sumup')
  const [sameAsShipping, setSameAsShipping] = useState(true)

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
      shippingMethod: 'standard',
      shippingPrice: 5.95,
      taxes: 0,
    },
  })

  const { watch } = methods
  const currentValues = watch()

  useEffect(() => {
    if (!data || data.lineItems.length === 0) return
    trackEvent('begin_checkout', {
      userId: currentValues?.userId,
      total_value: currentValues.totalPrice,
      currency: currentValues.currency,
      item_count: currentValues.lineItems.length,
      items: currentValues.lineItems.map(
        (item) => item.quantity + ' * ' + item.sku,
      ),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!data || data.lineItems.length === 0) {
    return redirect('/cart')
  }

  const onInformationSubmit = async () => setStep(2)

  const nextToPayment = async () => {
    try {
      setLoading(true)
      await updateCartPrice(
        currentValues.subtotalPrice,
        currentValues.totalPrice,
        currentValues.taxes,
        currentValues.shippingPrice,
      )

      if (paymentProvider === 'klarna') {
        const klarnaResponse = await fetch(
          '/api/payments/klarna/create-session',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: `ORDER-${Date.now()}`,
              amount: currentValues.totalPrice,
              currency: currentValues.currency,
            }),
          },
        )
        const klarnaData = await klarnaResponse.json()
        if (klarnaData.success) {
          setStep(3)
        } else {
          Sentry.captureMessage(
            `Klarna init failed: ${klarnaData.message}`,
            'error',
          )
          toast(klarnaData.message || 'Failed to initialize Klarna')
        }
      } else {
        const response = await createSumUpCheckout()
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
          Sentry.captureMessage(
            `SumUp init failed: ${response.message}`,
            'error',
          )
          toast(response.message)
        } else {
          setCheckoutId(response.data || '')
          setStep(3)
        }
      }
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const onPaymentComplete = async () => {
    let red = false
    try {
      setLoading(true)

      const orderResponse = await createOrder(checkoutId, currentValues)

      if (orderResponse.success) {
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
          to: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@curlypottery.com',
          subject: `New Order: ${orderResponse.data?.id?.slice(-6).toUpperCase() || ''}`,
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
      } else {
        Sentry.captureMessage(
          `Order creation failed: ${orderResponse.message}`,
          'error',
        )
        toast.error(orderResponse.message)
      }
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
    } finally {
      setLoading(false)
    }
    if (red) redirect('/checkout/success')
  }

  const goBack = (goStep: number) => {
    if (step > goStep) setStep(goStep)
  }

  return (
    <FormProvider {...methods}>
      <Container className="px-4 py-6 sm:px-10 sm:py-10 mx-auto grid grid-cols-1 lg:max-w-5xl lg:grid-cols-12 gap-20">
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
          {step === 2 && (
            <div className="space-y-6">
              <section className="space-y-4">
                <Text variant="bold">Billing Address</Text>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
                    <input
                      type="radio"
                      name="billingType"
                      checked={sameAsShipping}
                      onChange={() => setSameAsShipping(true)}
                      className="mr-3"
                    />
                    <Text>Same as shipping address</Text>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
                    <input
                      type="radio"
                      name="billingType"
                      checked={!sameAsShipping}
                      onChange={() => setSameAsShipping(false)}
                      className="mr-3"
                    />
                    <Text>Use a different billing address</Text>
                  </label>
                </div>

                {!sameAsShipping && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-accent/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="col-span-2">
                      <Input
                        placeholder="Address"
                        {...methods.register('billingAddress.address', {
                          required: !sameAsShipping,
                        })}
                      />
                    </div>
                    <Input
                      placeholder="City"
                      {...methods.register('billingAddress.city', {
                        required: !sameAsShipping,
                      })}
                    />
                    <Input
                      placeholder="Postal code"
                      {...methods.register('billingAddress.postalCode', {
                        required: !sameAsShipping,
                      })}
                    />
                    <Input
                      placeholder="Country"
                      {...methods.register('billingAddress.country', {
                        required: !sameAsShipping,
                      })}
                    />
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <Text variant="bold">Select Payment Method</Text>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="sumup"
                      checked={paymentProvider === 'sumup'}
                      onChange={() => setPaymentProvider('sumup')}
                      className="mr-3"
                    />
                    <div>
                      <Text variant="bold">Credit/Debit Card (SumUp)</Text>
                      <Text variant="muted" className="text-sm">
                        Secure payment via SumUp
                      </Text>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="googlepay"
                      checked={paymentProvider === 'googlepay'}
                      onChange={() => setPaymentProvider('googlepay')}
                      className="mr-3"
                    />
                    <div>
                      <Text variant="bold">Google Pay / Apple Pay (SumUp)</Text>
                      <Text variant="muted" className="text-sm">
                        Fast and secure checkout via Google Pay/Apple Pay
                      </Text>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="klarna"
                      checked={paymentProvider === 'klarna'}
                      onChange={() => {
                        setPaymentProvider('klarna')
                      }}
                      className="mr-3"
                    />
                    <div>
                      <Text variant="bold">Klarna</Text>
                      <Text variant="muted" className="text-sm">
                        Pay now, pay later or in installments
                      </Text>
                    </div>
                  </label>
                </div>
              </section>

              <Button
                type="button"
                width="100%"
                loading={loading}
                color="success"
                onClick={async () => {
                  if (sameAsShipping) {
                    const shipping = methods.getValues('address')
                    methods.setValue('billingAddress', shipping)
                  }
                  await nextToPayment()
                }}
              >
                Continue to{' '}
                {paymentProvider === 'klarna'
                  ? 'Klarna'
                  : paymentProvider === 'googlepay'
                    ? 'Google Pay'
                    : 'Payment'}
              </Button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <Text variant="bold">Complete Your Payment</Text>
              {paymentProvider === 'sumup' ||
              paymentProvider === 'googlepay' ? (
                <SumUpPayment
                  checkoutId={checkoutId}
                  onComplete={onPaymentComplete}
                />
              ) : (
                <div className="p-4 border rounded-lg">
                  <Text variant="muted">Redirecting to Klarna...</Text>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <CheckoutSummary />
        </div>
      </Container>
    </FormProvider>
  )
}
